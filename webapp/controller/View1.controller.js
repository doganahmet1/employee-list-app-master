/* global moment:true */
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/smod/employeelistapp/utils/moment",
    "sap/ui/core/Fragment",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Filter, FilterOperator, momentjs, Fragment) {
    "use strict";

    return Controller.extend("com.smod.employeelistapp.controller.View1", {
      onInit: function () {
        var oViewModel = new JSONModel({
          displayMode: "grid", // grid or table
          searchQuery: "",
          PathManager: "",
          PathEmployees1: "",
        });

        this.getView().setModel(oViewModel, "empListModel");
      },

      onShowAsGrid: function () {
        var oModel = this.getView().getModel("empListModel");
        oModel.setProperty("/displayMode", "grid");
      },
      onShowAsTable: function () {
        var oModel = this.getView().getModel("empListModel");
        oModel.setProperty("/displayMode", "table");
      },

      ReportsPress: async function (oEvent) {
        var that = this,
          oViewModel = this.getView().getModel("empListModel"),
          oButton = oEvent.getSource(),
          oView = this.getView(),
          oModel = oView.getModel(),
          ManagerId = oButton.data("Manager"),
          sEmpleyees1 = `/Employees(${ManagerId})/Employees1`,
          sMng = `/Employees(${ManagerId})`,
          oMng = oModel.getProperty(sMng);

        const aEmployess = await new Promise(function (resolve) {
          oModel.read(sEmpleyees1, {
            success: function (oData_1) {
              resolve(oData_1.results);
            },
            error: function () {
              resolve(0);
            },
          });
        });
        oViewModel.setProperty("/PathEmployees1", aEmployess);
        oViewModel.setProperty("/PathManager", oMng);
        if (!that._pQuickView) {
          that._pQuickView = Fragment.load({
            id: oView.getId(),
            name: "com.smod.employeelistapp.fragment.QuickView",
            controller: that,
          }).then(
            function (oQuickView) {
              oQuickView.data("Manager", ManagerId);
              oView.addDependent(oQuickView);
              return oQuickView;
            }.bind(that)
          );
        }
        that._pQuickView.then(function (oQuickView_1) {
          oQuickView_1.setModel(oViewModel);
          oQuickView_1.openBy(oButton);
        });
      },

      onSearch: function (oEvent) {
        var oTable = this.getView().byId("employeeTable");
        var aFilter = [];
        var sQuery = oEvent.getParameter("query");
        if (sQuery) {
          aFilter.push(new Filter("Title", FilterOperator.Contains, sQuery));
        }

        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilter);
      },

      convertImagePath: function (imageData) {
        var sTrimmedData = imageData.substr(104);
        return "data:image/bmp;base64," + sTrimmedData;
      },
      getEmployeeById: function (employeeId) {
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})`;
        var oEmp = oModel.getProperty(sPath);

        return oEmp ? `${oEmp.FirstName} ${oEmp.LastName}` : "";
      },

      getDirectReportsCount: function (employeeId) {
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})/Employees1`;

        return new Promise(function (resolve, reject) {
          oModel.read(sPath, {
            success: function (oData) {
              resolve(oData.results.length);
            },
            error: function () {
              resolve(0);
            },
          });
        }).then(function (l) {
          return l > 0 ? l.toString() : "";
        });
      },
      hasDirectReports: function (employeeId) {
        var oModel = this.getView().getModel();
        var sPath = `/Employees(${employeeId})/Employees1`;

        return new Promise(function (resolve, reject) {
          oModel.read(sPath, {
            success: function (oData) {
              resolve(oData.results.length);
            },
            error: function () {
              resolve(0);
            },
          });
        }).then(function (l) {
          return l > 0 ? true : false;
        });
      },
      calculateAge: function (birthDate) {
        if (birthDate) {
          var diff = moment(birthDate).diff(moment(), "milliseconds");
          var duration = moment.duration(diff);
          return Math.abs(duration.years());
        }
        return "";
      },
    });
  }
);
