两种触发形式

一、医院船集成、监听具体一个表的变化，又新增数据触发即将pda插入到emr中

SELECT t1.ID As OrderID,OrderNo,OrderType,t1.PatientId,PatientName,t1.DepartmentCode As DivisionCode,t1.RevisionInfo_UserId As DoctorID FROM Od.TrnOrdering t1, Cm.TrnPatient t2 WHERE t1.PatientId = t2.PatientId AND EnforcedInfo_Status = 2 AND EnforcedInfo_Date = TO_CHAR(CURRENT_DATE,'YYYYMMDD') AND OrderType = 'Drug1'
 













 
二、慢病集成，通过bs-webservice触发

Class Bs.WebService Extends EnsLib.SOAP.Service //继承SOAP.Service 类

	if (pHint = "GetPatient")
	{

	set tsc= ..SendRequestSync("BP.HZINTE",pInput,.pOutput) //BS触发之后调用具体的BP--BP.HZINTE
	}

BP.HZINTE 链接两个BO--BO.GetInfo、BO.SetInfo
//外部调用web传入参数个給MSG.reqGetInfo作为BO.GetInfo的req参数
    set request=##class(MSG.reqGetInfo).%New()--->Class MSG.reqGetInfo Extends Ens.Request//继承Ens.Request类
    set request.UserId = UserId
    set request.PatientId = PatientId
    set request.StartDateTime = StartDateTime
    SET request.HospitalCode = HospitalCode

    set soapresponse=##class(MSG.resSetInfo).%New()--->Class MSG.resSetInfo Extends Ens.Response//继承Ens.Response类
    set soapresponse=response
BP内部
    <start>--->call BO.GetInfo--->call BO.SetInfo
    //BO.GetInfo req  MSG.reqGetInfo
    set target.callrequest.UserId=source.request.UserId;//target:BO.GetInfo,将BO需要的参数传入
	//BO.GetInfo res MSG.resGetInfo
	set target.context.UserId=source.callresponse.UserId;//MSG.resGetInfo传给中间变量
	//BO.SetInfo req MSG.reqSetInfo
	set target.callrequest.UserId=source.context.UserId;//target:BO.SetInfo,将BO需要的参数传入
	//BO.SetInfo res MSG.resSetInfo
	set target.response.Status=source.callresponse.Status//MSG.resSetInfo 传给？

BO.GET内部
	Method GetInfo(pRequest As MSG.reqGetInfo, Output pResponse As MSG.resGetInfo) As %Status//注意req res继承的类
	
	//获取住院患者就诊信息
    set tResult=##Class(EnsLib.SQL.OracleGatewayResultSet).%New()//取数据的方法的类
    //sql 外表获取数据
    set sql = "Select VISIT_ID, DEPT_ADMISSION_TO, ADMISSION_DATE_TIME, DISCHARGE_DATE_TIME, CONSULTING_DOCTOR from PAT_VISIT where PATIENT_ID = ? and ADMISSION_DATE_TIME >= TO_DATE(?,'yyyy-mm-dd')"
    //w为sql传参
    set tSC=..Adapter.ExecuteQuery(.tResult, sql, pRequest.PatientId, $E(pRequest.StartDateTime, 0, 10))
    //有数据 while。。
    while (tResult.Next())
    {
    	//																		//%Persistent 会生成有数可查询的表	
	    set PatientInfo 					= ##Class(ABS.PatientInfo).%New()--->Class ABS.PatientInfo Extends %Persistent
	    set PatientInfo.PatientId 			= pRequest.PatientId
     //每个主键对应一条list
	 do pResponse.PatientInfoList.Insert(PatientInfo)
BO.SET内部
	//写入诊断信息
	set Index = 0
	set misCnt = 0
	while(Index < pRequest.DiagnosisList.Count())
	{
		//获得新的一条诊断数据
		set Index = Index + 1
		set DiagInfo = pRequest.DiagnosisList.GetAt(Index)

	//插入或者更新
	set tRowNum=0
		Set tResultDiag = ##Class(EnsLib.SQL.GatewayResultSet).%New()
    	set sql = "select * from Ps.Diagnosis where UserId = ? and VisitId = ? and DiagnosisType = ? and DiagnosisNo = ?"
    	set tSC=..Adapter.ExecuteQuery(.tResultDiag, sql, UserId, VisitId, DiagInfo.DiagnosisType, DiagInfo.DiagnosisNo)
   		if tResultDiag.Next()
    	{
	    	Set sql = "Update Ps.Diagnosis Set Type = ? , DiagnosisCode = ? , Description = ? , RecordDate = ?, RevisionInfo_UserId = ?, RevisionInfo_UserName = ?, RevisionInfo_TerminalName = ?, RevisionInfo_TerminalIP = ?, RevisionInfo_DeviceType = ?, RevisionInfo_DateTime = ? where UserId = ? and VisitId = ? and DiagnosisType = ? and DiagnosisNo = ?"
	    	Set tSC = ..Adapter.ExecuteUpdate(.tRowNum, sql, DiagType, DiagCode, DiagInfo.Description, DiagInfo.RecordDate, RevisionInfoUserId, RevisionInfoUserName, RevisionInfoTerminalName, RevisionInfoTerminalIP, RevisionInfoDeviceType, RevisionInfoDateTime, UserId, VisitId, DiagInfo.DiagnosisType, DiagInfo.DiagnosisNo)