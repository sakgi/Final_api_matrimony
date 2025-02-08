// const nodemailer = require("nodemailer");
// const { db } = require("../config/db");
// const { logActivity } = require("../utils/logActivity");
// const admin = require("firebase-admin"); // Ensure you have Firebase Admin SDK initialized

// // Utility function to escape HTML characters
// function escapeHtml(unsafe) {
//   if (typeof unsafe !== "string") {
//     return unsafe || ""; // Return empty string if /null
//   }
//   return unsafe
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }

// // Configure NodeMailer transport
// const transporter = nodemailer.createTransport({
//   service: "gmail", // You can use other services like Outlook, Yahoo, etc.
//   auth: {
//     user: "srajurkar614@gmail.com", // Replace with your email
//     pass: "pivg ldmv khkg wwbm", // Replace with your email password or app password
//   },
// });

// // Function to fetch employee name
// async function getEmployeeName(userId) {
//   const employeeRef = await db.collection("employeeData").doc(userId).get();
//   if (employeeRef.exists) {
//     console.log("Employee Named Fetched: ", employeeRef.data());
//     return employeeRef.data().Employee_Name; // Assuming the employee's name is stored under the key 'name'
//   }
//   throw new Error("Employee not found");
// }

// async function logEmailHistory(recipient, recipientName, clientName, employeeName, clientId, index) {
//   const currentDate = new Date();
//   const formattedDate = currentDate.toISOString().split("T")[0]; // Format as yyyy-mm-dd
//   const formattedTime = currentDate.toTimeString().split(" ")[0]; // Format as HH:mm:ss

//   const emailLog = {
//     recipient,
//     recipientName,
//     clientName,
//     employeeName,
//     timestamp: currentDate,
//     date: formattedDate,
//     time: formattedTime,
//     status: "sent", // You can update this to "failed" if there's an error
//   };

//   // Store the email log under the clientId and indexed format
//   const emailHistoryRef = db.collection("emailHistory").doc(clientId);
//   await emailHistoryRef.set({
//     [index]: emailLog
//   }, { merge: true }); // Use merge to avoid overwriting existing data
// }

// async function sendEmails(req, res) {
//   const { id, recipients, recipientNames, subject } = req.body; // Added recipientNames

//   const uid = req.userId;
//   console.log("From request uid", uid)

//   if (!id || !Array.isArray(recipients) || recipients.length === 0 || !Array.isArray(recipientNames) || recipientNames.length === 0) {
//     return res.status(400).json({ error: "Id, recipients, and recipient names are required." });
//   }

//   try {
//     let clientDataList = [];
//     const employeeName = await getEmployeeName(uid); // Fetch employee name

//     // Fetch client data from Firestore
//     if (Array.isArray(id)) {
//       for (const clientId of id) {
//         const userRef = db.collection("clientData").doc(clientId);
//         const userDoc = await userRef.get();

//         if (!userDoc.exists) {
//           return res.status(404).json({ error: `No client data found for ID: ${clientId}` });
//         }
//         clientDataList.push({ id: clientId, ...userDoc.data() });
//       }
//     } else {
//       const userRef = db.collection("clientData").doc(id);
//       const userDoc = await userRef.get();

//       if (!userDoc.exists) {
//         return res.status(404).json({ error: `No client data found for given ID` });
//       }
//       clientDataList.push({ id, ...userDoc.data() });
//     }

//     // Prepare email content
//     const emailContent = clientDataList.map((clientData) => `
//       <h2> Client Profile Details </h2>
//       <p><strong>Name:</strong> ${escapeHtml(clientData.userName || "N/A")}</p>
//       <p><strong>DOB:</strong> ${escapeHtml(clientData.birthDate || "N/A")}</p>
//       <p><strong>Education:</strong> ${escapeHtml(clientData.education || "N/A")}</ p>
//       <p><strong>Job:</strong> ${escapeHtml(clientData.job || "N/A")}</p>
//       <p><strong>Cast:</strong> ${escapeHtml(clientData.cast || "N/A")}</p>
//       <p><strong>SubCast:</strong> ${escapeHtml(clientData.subCast || "N/A")}</p>
//       <p><strong>Devak:</strong> ${escapeHtml(clientData.devak || "N/A")}</p>
//       <p><strong>Ras:</strong> ${escapeHtml(clientData.ras || "N/A")}</p>
//       <p><strong>Gan:</strong> ${escapeHtml(clientData.gan || "N/A")}</p>
//       <p><strong>BloodGroup:</strong> ${escapeHtml(clientData.bloodGroup || "N/A")}</p>
//       <p><strong>Demands:</strong> ${escapeHtml(clientData.demands || "N/A")}</p>
//       <p><strong>Gender:</strong> ${escapeHtml(clientData.gender || "N/A")}</p>
//     `).join("<hr/>");

//     // Send emails to all recipients
//     for (let i = 0; i < recipients.length; i++) {
//       const recipient = recipients[i];
//       const recipientName = recipientNames[i] || "Unknown Recipient"; // Get recipient name from input

//       const mailOptions = {
//         from: "srajurkar614@gmail.com", // Replace with your email
//         to: recipient,
//         subject: subject,
//         html: emailContent,
//       };

//       await transporter.sendMail(mailOptions);

//       // Log the email history
//       for (const [index, clientData] of clientDataList.entries()) {
//         const clientName = clientData.userName || "Unknown Client";
//         await logEmailHistory(recipient, recipientName, clientName, employeeName, clientData.id, `${index + 1}st`);
//       }
//     }

//     // Notify profile owners and increment share count
//     for (const clientData of clientDataList) {
//       if (clientData.email) {
//         const ownerNotification = {
//           from: "srajurkar614@gmail.com",
//           to: clientData.email,
//           subject: "Your Profile Has Been Shared",
//           html: `
//             <p>Dear ${escapeHtml(clientData.userName || "User ")},</p>
//             <p>Your profile has been shared with the following recipients:</p>
//             <ul>${recipients.map((email) => `<li>${escapeHtml(email)}</li>`).join("")}</ul>
//             <p>If you have any concerns, please contact support.</p>
//           `,
//         };

//         await transporter.sendMail(ownerNotification);

//         // Increment the email share count
//         const userRef = db.collection("clientData").doc(clientData.id);
//         await userRef.update({
//           emailShareCount: admin.firestore.FieldValue.increment(1),
//         });
//       }
//     }

//     // Log activity
//     const message = "Profile shared via email";
//     await logActivity(message, req.userId);

//     console.log("Emails sent successfully, owners notified");
//     return res.status(200).json({ message: "Emails sent successfully" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return res.status(500).json({ error: "Failed to send emails" });
//   }
// }

// async function secondMail(req, res) {
//   const { id, recipients, recipientNames, subject } = req.body; // Added recipientNames

//   if (!id || !Array.isArray(recipients) || recipients.length === 0 || !Array.isArray(recipientNames) || recipientNames.length === 0) {
//     return res.status(400).json({ error: "Id, recipients, and recipient names are required." });
//   }

//   try {
//     let clientDataList = [];
//     const employeeName = await getEmployeeName(req.userId); // Fetch employee name

//     // Fetch client data from Firestore
//     if (Array.isArray(id)) {
//       for (const clientId of id) {
//         const userRef = db.collection("clientData").doc(clientId);
//         const userDoc = await userRef.get();

//         if (!userDoc.exists) {
//           return res.status(404).json({ error: `No client data found for ID: ${clientId}` });
//         }
//         clientDataList.push({ id: clientId, ...userDoc.data() });
//       }
//     } else {
//       const userRef = db.collection("clientData").doc(id);
//       const userDoc = await userRef.get();

//       if (!userDoc.exists) {
//         return res.status(404).json({ error: `No client data found for given ID` });
//       }
//       clientDataList.push({ id, ...userDoc.data() });
//     }

//     // Prepare email content
//     const emailContent = clientDataList .map((clientData) => `
//       <h2> Client Profile Details </h2>
//       <p><strong>Photo:</strong> ${escapeHtml(clientData.file || "N/A")}</p>
//       <p><strong>Name:</strong> ${escapeHtml(clientData.userName || "N/A")}</p>
//       <p><strong>DOB:</strong> ${escapeHtml(clientData.birthDate || "N/A")}</p>
//       <p><strong>Education:</strong> ${escapeHtml(clientData.education || "N/A")}</p>
//       <p><strong>Address:</strong> ${escapeHtml(clientData.address || "N/A")}</p>
//       <p><strong>Job:</strong> ${escapeHtml(clientData.job || "N/A")}</p>
//       <p><strong>Phone:</strong> ${escapeHtml(clientData.phoneNumber || "N/A")}</p>
//       <p><strong>Email:</strong> ${escapeHtml(clientData.email || "N/A")}</p>
//       <p><strong>Cast:</strong> ${escapeHtml(clientData.cast || "N/A")}</p>
//       <p><strong>SubCast:</strong> ${escapeHtml(clientData.subCast || "N/A")}</p>
//       <p><strong>Devak:</strong> ${escapeHtml(clientData.devak || "N/A")}</p>
//       <p><strong>Ras:</strong> ${escapeHtml(clientData.ras || "N/A")}</p>
//       <p><strong>Gan:</strong> ${escapeHtml(clientData.gan || "N/A")}</p>
//       <p><strong>BloodGroup:</strong> ${escapeHtml(clientData.bloodGroup || "N/A")}</p>
//       <p><strong>Demands:</strong> ${escapeHtml(clientData.demands || "N/A")}</p>
//     `).join("<hr/>");

//     // Send emails to all recipients
//     for (let i = 0; i < recipients.length; i++) {
//       const recipient = recipients[i];
//       const recipientName = recipientNames[i] || "Unknown Recipient"; // Get recipient name from input

//       const mailOptions = {
//         from: "srajurkar614@gmail.com", // Replace with your email
//         to: recipient,
//         subject: subject,
//         html: emailContent,
//       };

//       await transporter.sendMail(mailOptions);

//       // Log the email history
//       for (const [index, clientData] of clientDataList.entries()) {
//         const clientName = clientData.userName || "Unknown Client";
//         await logEmailHistory(recipient, recipientName, clientName, employeeName, clientData.id, `${index + 1}st`);
//       }
//     }

//     // Notify profile owners and increment share count
//     for (const clientData of clientDataList) {
//       if (clientData.email) {
//         const ownerNotification = {
//           from: "srajurkar614@gmail.com",
//           to: clientData.email,
//           subject: "Your Profile Has Been Shared",
//           html: `
//             <p>Dear ${escapeHtml(clientData.userName || "User  ")},</p>
//             <p>Your profile has been shared with the following recipients:</p>
//             <ul>${recipients.map((email) => `<li>${escapeHtml(email)}</li>`).join("")}</ul>
//             <p>If you have any concerns, please contact support.</p>
//           `,
//         };

//         await transporter.sendMail(ownerNotification);

//         // Increment the email share count
//         const userRef = db.collection("clientData").doc(clientData.id);
//         await userRef.update({
//           emailShareCount: admin.firestore.FieldValue.increment(1),
//         });
//       }
//     }

//     // Log activity
//     const message = "Profile shared via email (secondMail)";
//     await logActivity(message, req.userId);

//     console.log("Emails sent successfully, owners notified (secondMail)");
//     return res.status(200).json({ message: "Emails sent successfully" });
//   } catch (error) {
//     console.error("Error sending email (secondMail):", error.message);
//     return res.status(500).json({ error: "Failed to send emails (secondMail)" });
//   }
// }

// module.exports = { sendEmails, secondMail };













const nodemailer = require("nodemailer");
const { db } = require("../config/db");
const { logActivity } = require("../utils/logActivity");
const admin = require("firebase-admin"); // Ensure you have Firebase Admin SDK initialized

// Utility function to escape HTML characters
function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") {
    return unsafe || ""; // Return empty string if /null
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Configure NodeMailer transport
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: "srajurkar614@gmail.com", // Replace with your email
    pass: "pivg ldmv khkg wwbm", // Replace with your email password or app password
  },
});

// Function to fetch employee name
async function getEmployeeName(userId) {
  const employeeRef = await db.collection("employeeData").doc(userId).get();
  if (employeeRef.exists) {
    console.log("Employee Named Fetched: ", employeeRef.data());
    return employeeRef.data().Employee_Name; // Assuming the employee's name is stored under the key 'name'
  }
  throw new Error("Employee not found");
}

async function logEmailHistory(recipient, recipientName, clientName, employeeName, clientId,  type ) {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0]; // Format as yyyy-mm-dd
  const formattedTime = currentDate.toTimeString().split(" ")[0]; // Format as HH:mm:ss

  const emailLog = {
    recipient,
    recipientName,
    clientName,
    employeeName,
    timestamp: currentDate,
    date: formattedDate,
    time: formattedTime,
    sharedby:"Email",
    status: "sent", // You can update this to "failed" if there's an error
    type, 
  };

  // Store the email log under the clientId with a unique key
  const emailHistoryRef = db.collection("emailHistory").doc(clientId);
  const logKey = `log_${Date.now()}`; // Create a unique key using the current timestamp
  await emailHistoryRef.set({
    [logKey]: emailLog
  }, { merge: true }); // Use merge to avoid overwriting existing data
}

async function sendEmails(req, res) {
  const { id, recipients, recipientNames, subject } = req.body; // Added recipientNames

  const uid = req.userId;
  console.log("From request uid", uid)

  if (!id || !Array.isArray(recipients) || recipients.length === 0 || !Array.isArray(recipientNames) || recipientNames.length === 0) {
    return res.status(400).json({ error: "Id, recipients, and recipient names are required." });
  }

  try {
    let clientDataList = [];
    const employeeName = await getEmployeeName(uid); // Fetch employee name

    // Fetch client data from Firestore
    if (Array.isArray(id)) {
      for (const clientId of id) {
        const userRef = db.collection("clientData").doc(clientId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: `No client data found for ID: ${clientId}` });
        }
        clientDataList.push({ id: clientId, ...userDoc.data() });
      }
    } else {
      const userRef = db.collection("clientData").doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: `No client data found for given ID` });
      }
      clientDataList.push({ id, ...userDoc.data() });
    }

    // Prepare email content
    const emailContent = clientDataList.map((clientData) => `
      <h2> Client Profile Details </h2>
      <p><strong>Name:</strong> ${escapeHtml(clientData.userName || "N/A")}</p>
      <p><strong>DOB:</strong> ${escapeHtml(clientData.birthDate || "N/A")}</p>
      <p><strong>Education:</strong> ${escapeHtml(clientData.education || "N/A")}</p>
      <p><strong>Job:</strong> ${escapeHtml(clientData.job || "N/A")}</p>
      <p><strong>Cast:</strong> ${escapeHtml(clientData.cast || "N/A")}</p>
      <p><strong>SubCast:</strong> ${escapeHtml(clientData.subCast || "N/A")}</p>
      <p><strong>Devak:</strong> ${escapeHtml(clientData.devak || "N/A")}</p>
      <p><strong>Ras:</strong> ${escapeHtml(clientData.ras || "N/A")}</p>
      <p><strong>Gan:</strong> ${escapeHtml(clientData.gan || "N/A")}</p>
      <p><strong>BloodGroup:</strong> ${escapeHtml(clientData.bloodGroup || "N/A")}</p>
      <p><strong>Demands:</strong> ${escapeHtml(clientData.demands || "N/A")}</p>
      <p><strong>Gender:</strong> ${escapeHtml(clientData.gender || "N/A")}</p>
    `).join("<hr/>");

    // Send emails to all recipients
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const recipientName = recipientNames[i] || "Unknown Recipient"; // Get recipient name from input

      const mailOptions = {
        from: "srajurkar614@gmail.com", // Replace with your email
        to: recipient,
        subject: subject,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);

      // Log the email history
      for (const clientData of clientDataList) {
        const clientName = clientData.userName || "Unknown Client";
        await logEmailHistory(recipient, recipientName, clientName, employeeName, clientData.id,  "Without Contact Detail");
      }
    }

    // Notify profile owners and increment share count
    for (const clientData of clientDataList) {
      if (clientData.email) {
        const ownerNotification = {
          from: "srajurkar614@gmail.com",
          to: clientData.email,
          subject: "Your Profile Has Been Shared",
          html: `
            <p>Dear ${escapeHtml(clientData.userName || "User  ")},</p>
            <p>Your profile has been shared with the following recipients:</p>
            <ul>${recipients.map((email) => `<li>${escapeHtml(email)}</li>`).join("")}</ul>
            <p>If you have any concerns, please contact support.</p>
          `,
        };

        await transporter.sendMail(ownerNotification);

        // Increment the email share count
        const userRef = db.collection("clientData").doc(clientData.id);
        await userRef.update({
          emailShareCount: admin.firestore.FieldValue.increment(1),
        });
      }
    }

    // Log activity
    const message = "Profile shared via email";
    await logActivity(message, req.userId);

    console.log("Emails sent successfully, owners notified");
    return res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send emails" });
  }
}

async function secondMail(req, res) {
  const { id, recipients, recipientNames, subject } = req.body; // Added recipientNames

  if (!id || !Array.isArray(recipients) || recipients.length === 0 || !Array.isArray(recipientNames) || recipientNames.length === 0) {
    return res.status(400).json({ error: "Id, recipients, and recipient names are required." });
  }

  try {
    let clientDataList = [];
    const employeeName = await getEmployeeName(req.userId); // Fetch employee name

    // Fetch client data from Firestore
    if (Array.isArray(id)) {
      for (const clientId of id) {
        const userRef = db.collection("clientData").doc(clientId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: `No client data found for ID: ${clientId}` });
        }
        clientDataList.push({ id: clientId, ...userDoc.data() });
      }
    } else {
      const userRef = db.collection("clientData").doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: `No client data found for given ID` });
      }
      clientDataList.push({ id, ...userDoc.data() });
    }

    // Prepare email content
    const emailContent = clientDataList.map((clientData) => `
      <h2> Client Profile Details </h2>
      <p><strong>Photo:</strong> ${escapeHtml(clientData.file || "N/A")}</p>
      <p><strong>Name:</strong> ${escapeHtml(clientData.userName || "N/A")}</p>
      <p><strong>DOB:</strong> ${escapeHtml(clientData.birthDate || "N/A")}</p>
      <p><strong>Education:</strong> ${escapeHtml(clientData.education || "N/A")}</p>
      <p><strong>Address:</strong> ${escapeHtml(clientData.address || "N/A")}</p>
      <p><strong>Job:</strong> ${escapeHtml(clientData.job || "N/A")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(clientData.phoneNumber || "N/A")}</p>
      <p><strong>Email:</strong> ${escapeHtml(clientData.email || "N/A")}</p>
      <p><strong>Cast:</strong> ${escapeHtml(clientData.cast || "N/A")}</p>
      <p><strong>SubCast:</strong> ${escapeHtml(clientData.subCast || "N/A")}</p>
      <p><strong>Devak:</strong> ${escapeHtml(clientData.devak || "N/A")}</p>
      <p><strong>Ras:</strong> ${escapeHtml(clientData.ras || "N/A")}</p>
      <p><strong>Gan:</strong> ${escapeHtml(clientData.gan || "N/A")}</p>
      <p><strong>BloodGroup:</strong> ${escapeHtml(clientData.bloodGroup || "N/A")}</p>
      <p><strong>Demands:</strong> ${escapeHtml(clientData.demands || "N/A")}</p>
    `).join("<hr/>");

    // Send emails to all recipients
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const recipientName = recipientNames[i] || "Unknown Recipient"; // Get recipient name from input

      const mailOptions = {
        from: "srajurkar614@gmail.com", // Replace with your email
        to: recipient,
        subject: subject,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);

      // Log the email history
      for (const clientData of clientDataList) {
        const clientName = clientData.userName || "Unknown Client";
        await logEmailHistory(recipient, recipientName, clientName, employeeName, clientData.id, "With Contact Detail");
      }
    }

    // Notify profile owners and increment share count
    for (const clientData of clientDataList) {
      if (clientData.email) {
        const ownerNotification = {
          from: "srajurkar614@gmail.com",
          to: clientData.email,
          subject: "Your Profile Has Been Shared",
          html: `
            <p>Dear ${escapeHtml(clientData.userName || "User   ")},</p>
            <p>Your profile has been shared with the following recipients:</p>
            <ul>${recipients.map((email) => `<li>${escapeHtml(email)}</li>`).join("")}</ul>
            <p>If you have any concerns, please contact support.</p>
          `,
        };

        await transporter.sendMail(ownerNotification);

        // Increment the email share count
        const userRef = db.collection("clientData").doc(clientData.id);
        await userRef.update({
          emailShareCount: admin.firestore.FieldValue.increment(1),
        });
      }
    }

    // Log activity
    const message = "Profile shared via email (secondMail)";
    await logActivity(message, req.userId);

    console.log("Emails sent successfully, owners notified (secondMail)");
    return res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending email (secondMail):", error.message);
    return res.status(500).json({ error: "Failed to send emails (secondMail)" });
  }
}

module.exports = { sendEmails, secondMail };