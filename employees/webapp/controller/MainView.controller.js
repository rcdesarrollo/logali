sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        /*        function myCheck() {
                    var inputEmployee = this.byId("inputEmployee");
                    var valueEmploee = inputEmployee.getValue();
        
                    if (valueEmploee.length === 6) {
                        inputEmployee.setDescription("OK");
                    } else {
                        inputEmployee.setDescription("Not OK");
                    }
                } */
        // Para controlar los errores
        var Main = Controller.extend("logaligroup.employees.controller.MainView", {});

        // onValidate: myCheck,

        Main.prototype.onValidate = function () {
            var inputEmployee = this.byId("inputEmployee");
            var valueEmploee = inputEmployee.getValue();

            if (valueEmploee.length === 6) {
                //inputEmployee.setDescription("OK");
                this.byId("labelCountry").setVisible(true);
                this.byId("slCountry").setVisible(true);
            } else {
                //inputEmployee.setDescription("Not OK");
                this.byId("labelCountry").setVisible(false);
                this.byId("slCountry").setVisible(false);
            }
        };

        return Main;

    });
