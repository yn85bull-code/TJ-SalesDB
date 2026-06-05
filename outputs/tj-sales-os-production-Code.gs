function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile('SalesDeptDashboard')
    .setTitle('TJ-SalesOS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

