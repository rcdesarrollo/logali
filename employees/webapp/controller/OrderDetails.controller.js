sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {

    function _onObjectMatched(oEvent) {
        this.getView().bindElement({
            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "odataNorthwind"
        });
    };

    return Controller.extend("logaligroup.employees.controller.OrderDetails", {

        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);

        },

        onBack: function (oEvent) {

            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", true);
            };

        },
        onClearSignature: function (oEvent) {
            var signature = this.byId("signature");
            signature.clear();
        },

        factoryOrderDetails: function (listId, oContext) {

            //https://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/?$format=json
            //https://services.odata.org/V2/Northwind/Northwind.svc/Orders(10258)/Order_Details?$format=json
            //https://services.odata.org/V2/Northwind/Northwind.svc/Orders(10258)/Order_Details/?$format=json
            //https://services.odata.org/V2/Northwind/Northwind.svc/Orders(10258)/?$format=json
            
            // Modelo para FACTORY
            //https://services.odata.org/V2/Northwind/Northwind.svc/Orders(10258)/Order_Details?$expand=Product&$format=json

            var contextObject = oContext.getObject();
            contextObject.Currency = "EUR";
            var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

            if (contextObject.Quantity <= unitsInStock) {
                var objectListItem = new sap.m.ObjectListItem({
                    title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                    number: "{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency', formatOptions: {showMeasure: false}}",
                    numberUnit: "{odataNorthwind>Currency}"
                });
                return objectListItem;
            } else {
                var customListItem = new sap.m.CustomListItem({
                    content: [
                        new sap.m.Bar({
                            contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                            contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error" }),
                            contentRight: new sap.m.Label({ text: "{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}" })
                        })
                    ]
                });
                return customListItem;
            }

        }

    });

});