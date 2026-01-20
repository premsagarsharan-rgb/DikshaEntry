import jsPDFInvoiceTemplate from "jspdf-invoice-template";

export function generateInvoicePDF(data) {
  const props = {
    outputType: "save", // auto download
    returnJsPDFDocObject: false,
    fileName: `Pending_${data.fullName}_${Date.now()}`,
    orientationLandscape: false,
    compress: true,

    business: {
      name: "My Organization",
      address: "Main Office Address",
      phone: "9999999999",
      email: "office@example.com",
      website: "www.example.com",
    },

    contact: {
      label: "Customer:",
      name: data.fullName,
      address: data.address || "-",
      phone: data.mobileNumber,
    },

    invoice: {
      label: "Pending ID: ",
      num: data._id || "",
      invDate: new Date().toLocaleDateString(),
      invGenDate: new Date().toLocaleString(),
      headerBorder: false,
      tableBodyBorder: false,

      header: [
        { title: "Field", style: { width: 60 } },
        { title: "Value", style: { width: 120 } },
      ],

      table: [
        ["Full Name", data.fullName],
        ["Mobile", data.mobileNumber],
        ["Gender", data.gender || "-"],
        ["DOB", data.dob || "-"],
        ["Address", data.address || "-"],
      ],

      additionalRows: [
        {
          col1: "Status:",
          col2: "SUBMITTED",
          style: { fontSize: 12 },
        },
      ],
    },

    footer: {
      text: "This is a system generated document.",
    },

    pageEnable: true,
    pageLabel: "Page ",
  };

  jsPDFInvoiceTemplate(props);
}
