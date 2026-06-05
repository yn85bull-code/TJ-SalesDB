function doGet() {
  const htmlFileNames = ['TJ_SalesOS_Demo', 'tj-sales-os-demo', 'Index'];

  for (const fileName of htmlFileNames) {
    try {
      return HtmlService
        .createHtmlOutputFromFile(fileName)
        .setTitle('TJ-SalesOS Demo')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (e) {
      // Try the next common demo HTML file name.
    }
  }

  throw new Error('TJ-SalesOS demo HTML file was not found. Create an HTML file named TJ_SalesOS_Demo, tj-sales-os-demo, or Index.');
}
