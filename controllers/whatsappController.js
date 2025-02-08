// const twilio = require("twilio");
// const { admin } = require("../config/db");
// const { logActivity } = require('../utils/logActivity');

// const accountSid = "AC4ed772f04e5bdb7f7b5ce51aca4e6241";
// const authToken = "d1d9ab0734e4a0715dd57013286e3574";
// const client = twilio(accountSid, authToken);

// /**
//  * Function to mask sensitive data.
//  * @param {Object} data - The client data object to mask.
//  * @returns {Object} - The masked data object.
//  */
// function maskSensitiveData(data) {
//   return {
//     ...data,
//     address: data.address ? "****" : null, // Mask address
//     email: data.email ? "****@****.com" : null, // Mask email
//     phone: data.phone ? "****" : null, // Mask phone number
//   };
// }

// /**
//  * Send a WhatsApp message to a specific number.
//  * @param {string} to - The recipient's WhatsApp number.
//  * @param {string} message - The message to send.
//  * @returns {Object} - The response from Twilio.
//  */
// async function sendMessageToUser(to, message) {
//   try {
//     const messageResponse = await client.messages.create({
//       from: "whatsapp:+14155238886", // Replace with your Twilio WhatsApp number
//       to,
//       body: message,
//     });
//     return messageResponse;
//   } catch (error) {
//     console.error(`Failed to send message to ${to}: ${error.message}`);
//     throw new Error(`Failed to send message: ${error.message}`);
//   }
// }

// /**
//  * Retrieve client data from Firebase and send it to WhatsApp numbers.
//  * @param {Array<string>} clientIds - Array of client IDs to retrieve data for.
//  * @param {Array<string>} numbers - Array of WhatsApp numbers to send data to.
//  * @param {string} userId - ID of the user initiating the action.
//  * @returns {Array} - Array of results for each message sent.
//  */
// async function sendClientDataToWhatsApp(clientIds, numbers, userId) {
//   if (!clientIds.length || !numbers.length) {
//     throw new Error("Invalid input: clientIds and numbers cannot be empty.");
//   }

//   const results = [];
//   const clientDataPromises = clientIds.map((clientId) =>
//     admin.firestore().collection("clientData").doc(clientId).get()
//   );

//   try {
//     const clientDataSnapshots = await Promise.all(clientDataPromises);

//     const clientsData = clientDataSnapshots
//       .filter((snapshot) => snapshot.exists)
//       .map((snapshot) => maskSensitiveData(snapshot.data()));

//     for (const number of numbers) {
//       for (const clientData of clientsData) {
//         const message = formatClientMessage(clientData);
//         const whatsappNumber = `whatsapp:${number}`;
//         try {
//           const result = await sendMessageToUser(whatsappNumber, message);
//           results.push({ number, success: true, result });
//         } catch (error) {
//           results.push({ number, success: false, error: error.message });
//         }
//       }
//     }

//     await logActivity("Shared clients' profile by IDs", userId);
//     return results;
//   } catch (error) {
//     console.error(`Error retrieving client data: ${error.message}`);
//     throw new Error(`Error retrieving client data: ${error.message}`);
//   }
// }

// /**
//  * Format client data into a readable message for WhatsApp.
//  * @param {Object} clientData - The client data to format.
//  * @returns {string} - The formatted message.
//  */
// function formatClientMessage(clientData) {
//   return `
// 🔹 *Client Details* 🔹
// 📌 Name: ${clientData.name || "N/A"}
// 📌 Address: ${clientData.address || "N/A"}
// 📌 Email: ${clientData.email || "N/A"}
// 📌 Phone: ${clientData.phone || "N/A"}

// Please let us know if you have further questions.
//   `;
// }

// module.exports = {
//   sendClientDataToWhatsApp,
// };












const twilio = require("twilio");
const { admin } = require("../config/db");
const { logActivity } = require('../utils/logActivity');

const accountSid = "AC4ed772f04e5bdb7f7b5ce51aca4e6241";
const authToken = "d1d9ab0734e4a0715dd57013286e3574";
const client = twilio(accountSid, authToken);

/**
 * Function to mask sensitive data.
 * @param {Object} data - The client data object to mask.
 * @returns {Object} - The masked data object.
 */
function maskSensitiveData(data) {
  return {
    ...data,
    address: data.address ? "****" : null, // Mask address
    email: data.email ? "****@****.com" : null, // Mask email
    phone: data.phone ? "****" : null, // Mask phone number
  };
}

/**
 * Send a WhatsApp message to a specific number.
 * @param {string} to - The recipient's WhatsApp number.
 * @param {string} message - The message to send.
 * @returns {Object} - The response from Twilio.
 */
async function sendMessageToUser(to, message) {
  try {
    const messageResponse = await client.messages.create({
      from: "whatsapp:+14155238886", // Replace with your Twilio WhatsApp number
      to,
      body: message,
    });
    return messageResponse;
  } catch (error) {
    console.error(`Failed to send message to ${to}: ${error.message}`);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

/**
 * Retrieve client data from Firebase and send it to WhatsApp numbers.
 * @param {Array<string>} clientIds - Array of client IDs to retrieve data for.
 * @param {Array<string>} numbers - Array of WhatsApp numbers to send data to.
 * @param {string} userId - ID of the user initiating the action.
 * @returns {Array} - Array of results for each message sent.
 */
async function sendClientDataToWhatsApp(clientIds, numbers, userId) {
  if (!clientIds.length || !numbers.length) {
    throw new Error("Invalid input: clientIds and numbers cannot be empty.");
  }

  const results = [];
  const clientDataPromises = clientIds.map((clientId) =>
    admin.firestore().collection("clientData").doc(clientId).get()
  );

  try {
    const clientDataSnapshots = await Promise.all(clientDataPromises);

    const clientsData = clientDataSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => maskSensitiveData(snapshot.data()));

    for (const number of numbers) {
      for (const clientData of clientsData) {
        const message = formatClientMessage(clientData);
        const whatsappNumber = `whatsapp:${number}`;
        try {
          const result = await sendMessageToUser(whatsappNumber, message);
          results.push({ number, success: true, result });
        } catch (error) {
          results.push({ number, success: false, error: error.message });
        }
      }
    }

    await logActivity("Shared clients' profile by IDs", userId);
    return results;
  } catch (error) {
    console.error(`Error retrieving client data: ${error.message}`);
    throw new Error(`Error retrieving client data: ${error.message}`);
  }
}

/**
 * Format client data into a readable message for WhatsApp.
 * @param {Object} clientData - The client data to format.
 * @returns {string} - The formatted message.
 */
function formatClientMessage(clientData) {
  return `
🔹 *Client Details* 🔹
📌 Name: ${clientData.name || "N/A"}
📌 Address: ${clientData.address || "N/A"}
📌 Email: ${clientData.email || "N/A"}
📌 Phone: ${clientData.phone || "N/A"}

Please let us know if you have further questions.
  `;
}

/**
 * Retrieve client data from Firebase and send it to WhatsApp numbers with more information.
 * @param {Array<string>} clientIds - Array of client IDs to retrieve data for.
 * @param {Array<string>} numbers - Array of WhatsApp numbers to send data to.
 * @param {string} userId - ID of the user initiating the action.
 * @returns {Array} - Array of results for each message sent.
 */
async function sendClientDataToWhatsAppWithMoreInfo(clientIds, numbers, userId) {
  if (!clientIds.length || !numbers.length ) {
    throw new Error("Invalid input: clientIds and numbers cannot be empty.");
  }

  const results = [];
  const clientDataPromises = clientIds.map((clientId) =>
    admin.firestore().collection("clientData").doc(clientId).get()
  );

  try {
    const clientDataSnapshots = await Promise.all(clientDataPromises);

    const clientsData = clientDataSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.data()); // No masking here for more info

    for (const number of numbers) {
      for (const clientData of clientsData) {
        const message = formatDetailedClientMessage(clientData);
        const whatsappNumber = `whatsapp:${number}`;
        try {
          const result = await sendMessageToUser (whatsappNumber, message);
          results.push({ number, success: true, result });
        } catch (error) {
          results.push({ number, success: false, error: error.message });
        }
      }
    }

    await logActivity("Shared clients' profile with more info by IDs", userId);
    return results;
  } catch (error) {
    console.error(`Error retrieving client data: ${error.message}`);
    throw new Error(`Error retrieving client data: ${error.message}`);
  }
}

/**
 * Format client data into a detailed readable message for WhatsApp.
 * @param {Object} clientData - The client data to format.
 * @returns {string} - The formatted message with more information.
 */
function formatDetailedClientMessage(clientData) {
  return `
🔹 *Client Details* 🔹
📌 Name: ${clientData.name || "N/A"}
📌 Address: ${clientData.address || "N/A"}
📌 Email: ${clientData.email || "N/A"}
📌 Phone: ${clientData.phone || "N/A"}
📌 Date of Birth: ${clientData.dob || "N/A"}
📌 Occupation: ${clientData.occupation || "N/A"}
📌 Notes: ${clientData.notes || "N/A"}

Please let us know if you have further questions.
  `;
}

module.exports = {
  sendClientDataToWhatsApp,
  sendClientDataToWhatsAppWithMoreInfo, // Export the new function
};