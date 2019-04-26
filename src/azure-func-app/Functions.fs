﻿namespace BFT.AzureFuncApp

open System
open Microsoft.Azure.WebJobs
open System.Net.Http
open Microsoft.Extensions.Logging
open Microsoft.Azure.WebJobs.Extensions.Http
open FSharp.Control.Tasks
open Models
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Mvc
open Newtonsoft.Json

[<RequireQualifiedAccess>]
module Settings =

  let getAppSettings name =
    let value = Environment.GetEnvironmentVariable(name)
    if String.IsNullOrWhiteSpace(value) then
      invalidOp (sprintf "App setting %s not found" name)
    else value

  let getDatabaseOptions () = {
    EndpointUrl = getAppSettings "DatabaseEndpointUrl"
    AccountKey = getAppSettings "DatabaseAccountKey"
    DatabaseId = "testers"
    CollectionId = "testers"
  }

module Functions =

  [<FunctionName("save-test-results-activity")>]
  let SaveTestResultsActivity([<ActivityTrigger>] input) = 
    async {
      let options = Settings.getDatabaseOptions ()

      let! (DocumentId documentId) = TesterAPI.saveTestResults options input

      return documentId
    } |> Async.StartAsTask

  [<FunctionName("process-test-results-orchestration")>]
  let ProcessTestResultsOrchestration ([<OrchestrationTrigger>] context: DurableOrchestrationContext) = 
    task {
      let input = context.GetInput<TestResults>()

      let! documentId = context.CallActivityAsync<string>("save-test-results-activity", input)

      return documentId
    }

  [<FunctionName("save-test-results-http-trigger")>]
  let SaveTestResultsHttpTriger 
    ([<HttpTrigger(AuthorizationLevel.Function, "post")>] req: HttpRequestMessage, 
     [<OrchestrationClient>] starter: DurableOrchestrationClient, 
     log: ILogger) =
    async {
      log.LogInformation("Posting test results...")

      let! formData = req.Content.ReadAsFormDataAsync() |> Async.AwaitTask

      if isNull formData then invalidOp "test result payload is required (Content-Type = application/x-www-form-urlencoded)"

      let testResults = {
          cnsvsId = formData.["cnsvs_id"]
          accountId = formData.["account_id"]
          testDate = formData.["test_date"]
          testTime = formData.["test_time"]
          timezone = formData.["timezone"]
          gmtTestDate = formData.["gmt_test_date"]
          gmtTestTime = formData.["gmt_test_time"]
          subjectId = formData.["subject_id"]
          birthDate = formData.["birth_date"]
          gender = formData.["gender"]
          duration = formData.["duration"]
          language = formData.["language"]
          reportData = formData.["report_data"]
        }

      if String.IsNullOrWhiteSpace(testResults.subjectId) then invalidOp "Test results must have a subject ID"

      let! orchestrationId = starter.StartNewAsync ("process-test-results-orchestration", testResults) |> Async.AwaitTask

      log.LogInformation(sprintf "Started orchestration with ID = '{%s}'." orchestrationId)

      return starter.CreateCheckStatusResponse(req, orchestrationId)
    } |> Async.StartAsTask

  [<FunctionName("get-tester-http-trigger")>]
  let GetTesterHttpTriger 
    ([<HttpTrigger(AuthorizationLevel.Function, "get")>] req: HttpRequest, log: ILogger) =
    async {
      log.LogInformation("Getting tester data...")

      let email = req.Query.["email"].ToString()

      if String.IsNullOrWhiteSpace(email) then
        return BadRequestObjectResult("email query param is required") :> IActionResult
      else
        let options = Settings.getDatabaseOptions()
        let filter = (Email email) |> EmailFilter

        let! testerOption = TesterAPI.getTester options filter

        return
          match testerOption with
          | None -> NotFoundObjectResult(sprintf "Tester with email '%s' not found" email) :> IActionResult
          | Some tester -> OkObjectResult(tester) :> IActionResult
    } |> Async.StartAsTask

  [<FunctionName("save-tester-http-trigger")>]
  let SaveTesterHttpTriger 
    ([<HttpTrigger(AuthorizationLevel.Function, "post")>] req: HttpRequest, log: ILogger) =
    async {
      log.LogInformation("Saving tester...")

      let! json = req.ReadAsStringAsync() |> Async.AwaitTask

      let tester = JsonConvert.DeserializeObject<Tester>(json)

      if box tester |> isNull then invalidOp "Tester payload is required"

      let options = Settings.getDatabaseOptions()

      let! (DocumentId documentId) = TesterAPI.saveTester options tester

      return OkObjectResult(documentId)
    } |> Async.StartAsTask
