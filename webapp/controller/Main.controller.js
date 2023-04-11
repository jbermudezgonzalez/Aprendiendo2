sap.ui.define([
    "sap/ui/core/mvc/Controller"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";
        var orden = 0;
        return Controller.extend("project6.controller.Main", {
            onInit: function () {

                var oModel = this.getOwnerComponent().getModel("nData");
                oModel.read("/Invoices", {
                    success: function (oData, oResponse) {
                        var valoresUnicos = [];
                        var Comprobante=1;
                        oData.results.forEach(element => {//Preparacion del array seguramente se pueda hacer en una llamada revisar luego
                            for (var i = 0; i < valoresUnicos.length; i++) {
                                if (valoresUnicos[i].Nombre === element.ShipName) {
                                    Comprobante = 0;
                                } else {
                                    Comprobante = 1;
                                }
                            }
                            if (Comprobante === 1) {
                                valoresUnicos.push({ Nombre: element.ShipName });//array con los valores unicos
                            }
                        });


                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(valoresUnicos);
                        this.getView().setModel(Modelo, "Invoices");
                    }.bind(this), error: function () {
                        console.log("Error");// Mensaje sencillo para marcar que da error en el console log
                    }
                });
                this.getView().byId("fragmentDialog").setEnabled(false);

            },

            onListSelect: function (oEvent) {
                var fModel = this.getOwnerComponent().getModel("nData");
                this.getView().byId("fragmentDialog").setEnabled(true);
                fModel.read("/Orders", {
                    success: function (oData) {
                        var model = oData.results;
                        var selectedItem = this.getView().byId("Nombres").getSelectedItem().getText();
                        const filtrados = [];
                        var datosTabla = [];

                        model.forEach(element => {
                            const elemento = element.ShipName;
                            if (elemento === selectedItem) {
                                filtrados.push({ Nombre: element.EmployeeID });
                                let text = element.OrderID.toString();//cojo el ultimo valor para comprobar si es impar
                                text.slice(-1);
                                var valor = parseInt(text);
                                const date2 = new Date(element.OrderDate);// controlo desde el backlend la fecha 
                                if (valor % 2 == 0) {
                                    datosTabla.push({
                                        ShipName: element.ShipName,
                                        CustomerID: element.CustomerID,
                                        OrderId: element.OrderID,
                                        EmployeeID: element.EmployeeID,
                                        OrderDate: date2.toLocaleDateString(),
                                        Impar: "sap-icon://decline"
                                    });
                                } else {
                                    datosTabla.push({
                                        ShipName: element.ShipName,
                                        CustomerID: element.CustomerID,
                                        OrderId: element.OrderID,
                                        EmployeeID: element.EmployeeID,
                                        OrderDate: date2.toLocaleDateString(),
                                        Impar: "sap-icon://accept"

                                    });
                                }
                            }

                        });
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(filtrados);
                        this.getView().setModel(Modelo, "filtrados");
                        var Modelo2 = new sap.ui.model.json.JSONModel();
                        Modelo2.setData(datosTabla);
                        this.getView().setModel(Modelo2, "Tabla");

                    }.bind(this), error: function () {
                        console.error("Mira el error en el debugger")
                    }
                });


            },

            onFilterId: function (oEvent) {
                var oView = this.getView();
                var oTable = oView.byId("table");
                var oBinding = oTable.getBinding("items");
                var selectedItem2 = this.getView().byId("filtrados").getSelectedItem().getText();
                var oFilters = [new sap.ui.model.Filter("EmployeeID", sap.ui.model.FilterOperator.EQ, selectedItem2)];
                oBinding.filter(oFilters);

            },


            //LLamada de funciones
            handleSortDialogConfirm: function (oEvent) {//Ordenacion con fiori-sapui5
                var oView = this.getView();
                var oTable = oView.byId("table");
                var mParams = oEvent.getParameters();
                var oBinding = oTable.getBinding("items");
                var sPath = mParams.sortItem.getKey();
                var bDescending = mParams.sortDescending;
                var aSorters = [];
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                oBinding.sort(aSorters);

            },

            displayDateTable: function (oEvent) {// coNTROL DE FECHA
                var fModel = this.getOwnerComponent().getModel("nData");

                var leaveSince = this.getView().byId("leaveSince").getValue();
                fModel.read("/Orders", {
                    success: function (oData) {
                        var datos = oData.results;
                        const filtrados = [];
                        const date = new Date(leaveSince);
                        datos.forEach(element => {
                            const date2 = new Date(element.OrderDate);
                            if (date.toDateString() === date2.toDateString()) {
                                filtrados.push({
                                    ShipName: element.ShipName,
                                    CustomerID: element.CustomerID,
                                    OrderId: element.OrderID,
                                    EmployeeID: element.EmployeeID,
                                    OrderDate: date2.toLocaleDateString()
                                });
                            }
                        });
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(filtrados);
                        this.getView().setModel(Modelo, "Tabla");

                    }.bind(this), error: function () {
                        console.log("Error");// Mensaje sencillo para marcar que da error en el console log
                    }
                });

            },
            onOpenDialog: function () {
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "AGAIN.project6.fragments.modal"
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onCloseDialog: function () {
                // note: We don't need to chain to the pDialog promise, since this event-handler
                // is only called from within the loaded dialog itself.
                this.byId("Sort").close();
            }
        });


    });
