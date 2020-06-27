import { NowRequest, NowResponse } from "@now/node";

require("dotenv").config();

const { IncomingForm } = require("formidable");
const form = new IncomingForm();

const postmark = require("postmark");
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

export default (req: NowRequest, res: NowResponse) => {
  try {
    form.parse(req, (error, fields) => {
      if (error) {
        throw error;
      }

      client
        .sendEmail({
          From: "teainfo@gshaly.com",
          To: process.env.CLIENT_EMAIL,
          Subject: "GS Haly Ordering Form",
          HtmlBody: `<p>${fields["first-name"]} ${fields["last-name"]} of ${fields["business-name"]} is interested in the following products:</p><p>${fields.products}</p><p><b>Contact Information</b><br>Business Name: ${fields["business-name"]}<br>Primary Business Type: ${fields["business-type"]}<br>Email Address: ${fields.email}<br>Phone Number: ${fields.phone}<br>Location: ${fields.location}</p><p><b>Additional Comments</b><br>${fields.comments}</p>`,
          TrackOpens: true,
        })
        .then(() => res.status(200).end())
        .catch((error: Error) =>
          res.status(400).end(JSON.parse(error.message))
        );
    });
  } catch (error) {
    res.status(400).end(JSON.parse(error.message));
  }
};
