sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {

    return Controller.extend("logaligroup.employees.controller.Main", {

        onBeforeRendering() {
            this._detailEmployeeView = this.getView().byId("detailEmployeeView");
        },

        onInit: function () {

            var oView = this.getView();
            //var i18nBundle = oView.getModel("i18n").getResourceBundle();

            var oJSONModelEmpl = new sap.ui.model.json.JSONModel();
            oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false);
            oView.setModel(oJSONModelEmpl, "jsonEmployees");

            var oJSONModelCountries = new sap.ui.model.json.JSONModel();
            oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
            oView.setModel(oJSONModelCountries, "jsonCountries");

            var oJSONModelLayout = new sap.ui.model.json.JSONModel();
            oJSONModelLayout.loadData("./localService/mockdata/Layout.json", false);
            oView.setModel(oJSONModelLayout, "jsonLayout");

            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                visibleID: true,
                visibleName: true,
                visibleCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            });
            oView.setModel(oJSONModelConfig, "jsonModelConfig");

            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);

            this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveODataIncidence, this);

            this._bus.subscribe("incidence", "onDeleteIncidence", function (channelId, eventId, data) {

                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                this.getView().getModel("incidenceModel").remove(
                    "/IncidentsSet(IncidenceId='" + data.IncidenceId +
                    "',SapId='" + data.SapId +
                    "',EmployeeId='" + data.EmployeeId + "')", {
                    success: function () {
                        this.onReaderODataIncidence.bind(this)(data.EmployeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteKO"));
                    }.bind(this)
                });

            }, this);

        },

        showEmployeeDetails: function (categoria, nameEvent, path) {
            var detailView = this.getView().byId("detailEmployeeView");
            detailView.bindElement("odataNorthwind>" + path);
            this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

            var incidenceModel = new sap.ui.model.json.JSONModel([]);
            detailView.setModel(incidenceModel, "incidenceModel");
            detailView.byId("tableIncidence").removeAllContent();

            this.onReaderODataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);

        },

        onSaveODataIncidence: function (channelId, eventId, data) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
            var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

            if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined') {
                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: employeeId.toString(),
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    CreationDateX: true,
                    Type: incidenceModel[data.incidenceRow].Type,
                    TypeX: true,
                    Reason: incidenceModel[data.incidenceRow].Reason,
                    ReasonX: true
                };

                this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                    success: function () {
                        this.onReaderODataIncidence.bind(this)(employeeId);
                        //sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOK"));

                        MessageBox.success(oResourceBundle.getText("odataSaveOK"));

                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"));
                    }.bind(this)
                });
            } else if (incidenceModel[data.incidenceRow].CreationDateX ||
                incidenceModel[data.incidenceRow].ReasonX ||
                incidenceModel[data.incidenceRow].TypeX) {

                var body = {
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                    Type: incidenceModel[data.incidenceRow].Type,
                    TypeX: incidenceModel[data.incidenceRow].TypeX,
                    Reason: incidenceModel[data.incidenceRow].Reason,
                    ReasonX: incidenceModel[data.incidenceRow].ReasonX
                };

                this.getView().getModel("incidenceModel").update(
                    "/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                    "',SapId='" + this.getOwnerComponent().SapId +
                    "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                    success: function () {
                        this.onReaderODataIncidence.bind(this)(employeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateKO"));
                    }.bind(this)
                });

            }
            else {
                sap.m.MessageToast.show(oResourceBundle.getText("odataNoChanges"));
            };

        },

        onReaderODataIncidence: function (employeeID) {

            this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                filters: [
                    new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                    new sap.ui.model.Filter("EmployeeId", "EQ", employeeID.toString())
                ],
                success: function (data) {
                    var incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                    incidenceModel.setData(data.results);

                    var tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                    tableIncidence.removeAllContent();

                    for (var incidence in data.results) {

                        data.results[incidence]._ValidateDate = true;
                        data.results[incidence].EnabledSave = false;
                        
                        var newIncidence = sap.ui.xmlfragment("logaligroup.employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                        this._detailEmployeeView.addDependent(newIncidence);
                        newIncidence.bindElement("incidenceModel>/" + incidence);
                        tableIncidence.addContent(newIncidence);
                    }
                }.bind(this),
                error: function (e) {
                    sap.m.MessageToast.show(oResourceBundle.getText("odataNoChanges"));
                }

            });

        }

    });

});