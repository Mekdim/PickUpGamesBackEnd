"use strict";
const {notify, addAsPending} = require("./notification");
const nodemailer = require("nodemailer");
const ical = require("ical-generator");
const database = require("../db/db");
const {getDate} = require("../util/time");

let html = ({ sessionId }) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <!--[if !mso]>
<!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <!--<![endif]-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Surprise some one invited you to play a game</title>

    <link href="https://fonts.googleapis.com/css?family=Libre+Franklin:300,600|Montserrat:300,500|Roboto:400" rel="stylesheet" />
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Graphik Light';
                font-style: normal;
                font-weight: 300;
                src: url(https://d2e2oszluhwxlw.cloudfront.net/font/Graphik/Graphik-Light.woff) format('woff');
                mso-font-alt: 'Arial';
            }
            @font-face {
                font-family: 'Graphik Reg';
                font-style: normal;
                font-weight: 400;
                src: url(https://d2e2oszluhwxlw.cloudfront.net/font/Graphik/Graphik-Regular.woff) format('woff');
                mso-font-alt: 'Arial';
            }
            @font-face {
                font-family: 'Euclid Med';
                font-style: normal;
                font-weight: 300;
                src: url(https://d2e2oszluhwxlw.cloudfront.net/font/Euclid/EuclidCircularB-Medium.woff) format('woff');
                mso-font-alt: 'Arial';
            }
            @font-face {
                font-family: 'Euclid Reg';
                font-style: normal;
                font-weight: 300;
                src: url(https://d2e2oszluhwxlw.cloudfront.net/font/Euclid/EuclidCircularB-Regular.woff) format('woff');
                mso-font-alt: 'Arial';
            }
        }
        sup {
            font-family: Arial, sans-serif;
            vertical-align: baseline;
            position: relative;
            top: -0.9em;
            font-size: 40%;
            line-height: 100%;
        }
        div,
        p,
        a,
        li,
        td {
            -webkit-text-size-adjust: none;
        }
        p {
            font-family: 'Graphik Light', 'Roboto', Helvetica, Arial, sans-serif;
            font-size: 22px;
            line-height: 32px;
            color: #111111;
            margin-bottom: 20px;
        }
        body {
            margin: 0;
            padding: 0;
            max-width: 640px;
            background-color: #ffffff;
            font-family: 'Graphik Light', 'Roboto', Helvetica, Arial, sans-serif;
            font-size: 22px;
            line-height: 32px;
            color: #111111;
        }
        table td {
            border-collapse: collapse;
            overflow: hidden !important;
        }
        .msoFix {
            mso-table-lspace: -1pt;
            mso-table-rspace: -1pt;
        }
        img {
            border: 0;
        }
        a {
            color: #666666;
        }
        .webkit {
            max-width: 640px;
        }
        .outer {
            margin: 0 auto;
            width: 100%;
            max-width: 640px;
        }
        @media screen yahoo {
            * {
                overflow: visible !important;
            }
        }
    </style>
</head>
<body style="font-family:Tahoma;font-size:12px;color:#000000;font-weight:normal;word-wrap:break-word;word-break:normal;margin:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;min-width:100%;background-color:#f2f2f2">
<div style="display:none;font-size:0px;color:#999999;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Kuaas Inc. play the game with your firends and stay healthy</div>
<center style="width:100%; table-layout:fixed; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
    <div class="webkit" style="max-width:640px;">

        <!--[if (gte mso 9)|(IE)]> <table cellpadding="0" cellspacing="0" border="0" width="640" align="center"> <tr> <td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;"> <![endif]-->
        <table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" class="outer" style="border-spacing:0; font-family:sans-serif; color:#464646; margin:0 auto; width:100%; max-width:640px; background-color:#ffffff;">
            <tbody>

            <!--Start Header-->

            <!--Start Hero Image-->
             <tr bgcolor="ffffff" style="background-color: #00bfa5">
                <td align="center" style="text-align:center; padding-top: 0px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tbody>
                        <tr>
                            <td align="center"><a href="https://kuaas.com">
                                <img alt="Kuas logo" border="0" class="deviceWidth" src="https://firebasestorage.googleapis.com/v0/b/kuas-cd526.appspot.com/o/images%2FKuasMain.jpg?alt=media&token=d5ab2e6b-01b6-4bd5-9420-82dff4e6479b" style="display:block; margin: 0px; padding-top: 10px; padding-bottom: 10px;" width="80" height="60"  /> </a></td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <!--End Hero Image-->
            <!--Start Divider Line-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" style="padding-top: 10px; padding-bottom: 10px;" valign="top" width="585">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="585">
                        <tbody>
                        <tr>
                            <td height="2" style="border-bottom: 2px solid #515151; line-height: 2px; font-size: 1px;">&nbsp;</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <!--End Divider Line-->


            <!--End Header-->

            <!--Start Hero  Section-->
            <tr style="background-color: #00BBF8">
                <td height="30" style="line-height: 30px;">&nbsp;</td>
            </tr>

            <!--Start Heading-->
            <tr style="background-color: #00BBF8">
                <td align="center">
                    <h1 style="font-family:'Euclid Med','Montserrat', Helvetica, Arial, sans-serif;font-size:80px;color:#ffffff;font-weight:bold;word-wrap:break-word;word-break:normal;margin:0;padding-right:30px;padding-bottom:10px;padding-top:0px;padding-left:30px;line-height:82px">You have been invited!</h1>
                </td>
            </tr>

            <!--End Heading-->
            <tr style="background-color: #00BBF8">
                <td height="30" style="line-height: 30px;">&nbsp;</td>
            </tr>

            <!--Start Subcopy  Section-->
            <tr style="background-color: #00BBF8">
                <td align="center" style="padding-right: 20px; padding-bottom:0px; padding-left: 20px;">
                    <p style="font-family:'Euclid Light', 'Montserrat', Helvetica, Arial, sans-serif;font-size:22px;color:#ffffff;font-weight:normal;word-wrap:break-word;word-break:normal;margin:0;line-height:30px;max-width:480px">Your friend invited you to join them in a game.</p>
                </td>
            </tr>

            <!--End Subcopy Section-->
            <tr style="background-color: #00BBF8">
                <td height="30" style="line-height: 30px;">&nbsp;</td>
            </tr>

            <!--Start Button Row-->
            <tr style="background-color: #00BBF8">
                <td align="center" valign="top" style="padding-bottom: 30px;">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;   border-radius: 2em;  overflow: hidden;">
                        <tbody>
                        <tr>
                            <td align="center" valign="middle" bgcolor="#213b2c" width="185" height="50" style="color: #ffffff; line-height: 18px; vertical-align: middle;"> <a href="https://kuaas.com/sessions/${sessionId}" style="color: #ffffff; font-size:17px; font-family: 'Euclid Reg','Montserrat', Helvetica, Arial, sans-serif; text-decoration: none; width:100%; display:inline-block;">

                                <!--[if (gte mso 9)|(IE)]> <span style="color: #ffffff; font-family: 'arial narrow', helvetica, arial, sans-serif; line-height: 18px; font-size: 17px"> <![endif]-->
                                Join session

                                <!--[if (gte mso 9)|(IE)]> </span> <![endif]-->
                            </a> </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr style="background-color: #00BBF8">
                <td height="30" style="line-height: 30px;">&nbsp;</td>
            </tr>
            <!-- END BUTTON ROW -->

            <!--Start Divider Line-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" style="padding-top: 10px; padding-bottom: 10px;" valign="top" width="585">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="585">
                        <tbody>
                        <tr>
                            <td height="2" style="border-bottom: 2px solid #515151; line-height: 2px; font-size: 1px;">&nbsp;</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <!--End Divider Line-->

            <!--Start Hero Image-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" style="text-align:center; padding-top: 0px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tbody>
                        <tr>
                            <td><a href="https://kuaas.com"><img alt="Kuas picture" border="0" class="deviceWidth" src="https://firebasestorage.googleapis.com/v0/b/kuas-cd526.appspot.com/o/images%2Finvite.png?alt=media&token=0ebba289-8a78-4b2d-8885-388ab4c2b03a" style="display:block; margin: 0px;" width="640" /> </a></td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>


            <!--Start Divider Line-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" style="padding-top: 10px; padding-bottom: 10px;" valign="top" width="585">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="585">
                        <tbody>
                        <tr>
                            <td height="2" style="border-bottom: 2px solid #515151; line-height: 2px; font-size: 1px;">&nbsp;</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <!--End Divider Line-->

            <!--End Heading-->
            <tr style="background-color: #FFFFFF">
                <td height="30" style="line-height: 30px;">&nbsp;</td>
            </tr>

            <!--Start Subcopy  Section-->
            <tr style="background-color: #ffffff">
                <td align="center" style="padding-right: 20px; padding-bottom:0px; padding-left: 20px;">
                    <p style="font-family:'Euclid Light', 'Montserrat', Helvetica, Arial, sans-serif;font-size:22px;color:#000000;font-weight:normal;word-wrap:break-word;word-break:normal;margin:0;line-height:30px;max-width:480px">Kuaas is a sport on-demand platform.</p>
                </td>
            </tr>

            <!--End Heading-->
            <tr style="background-color: #FFFFFF">
                <td height="30" style="line-height: 30px;">&nbsp;</td>
            </tr>

            <tr>
                <td align="center" valign="top" style="padding-bottom: 30px;">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;   border-radius: 2em;  overflow: hidden;">
                        <tbody>
                        <tr>
                            <td align="center" valign="middle" bgcolor="#213b2c" width="150" height="50" style="color: #ffffff; line-height: 18px; vertical-align: middle;"> <a href="https://kuaas.com" style="color: #ffffff; font-size:17px; font-family: 'Euclid Reg','Montserrat', Helvetica, Arial, sans-serif; text-decoration: none; width:100%; display:inline-block;">

                                <!--[if (gte mso 9)|(IE)]> <span style="color: #ffffff; font-family: 'arial narrow', helvetica, arial, sans-serif; line-height: 18px; font-size: 17px"> <![endif]-->
                                Learn More

                                <!--[if (gte mso 9)|(IE)]> </span> <![endif]-->
                            </a> </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>



            <!--Start Divider Line-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" style="padding-top: 20px; padding-bottom: 20px;" valign="top" width="585">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="585">
                        <tbody>
                        <tr>
                            <td height="2" style="border-bottom: 2px solid #515151; line-height: 2px; font-size: 1px;">&nbsp;</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <!--End Divider Line-->

            <!--Start Social Icons-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" style="padding-top: 0px; padding-bottom: 0px; padding-right: 8px; padding-left: 8px;" valign="top">

                    <!--Start Social Icons-->
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center" valign="top" style="padding-top: 0px; padding-bottom: 0px; padding-right: 0px; padding-left: 0px;">
                    <table role="presentation" width="175" align="center" border="0" cellpadding="0" cellspacing="0">
                        <tbody>
                        <tr>
                            <td width="30"> <a href="https://www.facebook.com/OfficialCricut"> <img src="https://d2e2oszluhwxlw.cloudfront.net/emails/helper_assets/2021/fb.png" alt="Facebook" border="0" width="26" height="26" style="display: block; margin: 0px; border: none;" /> </a> </td>
                            <td width="25" style="font-size: 0; line-height: 0;">
                                &nbsp;
                            </td>
                            <td width="30"> <a href="https://www.instagram.com/cricut/"> <img src="https://d2e2oszluhwxlw.cloudfront.net/emails/helper_assets/2021/instagram.png" alt="Instagram" border="0" width="26" height="26" style="display: block; margin: 0px; border: none;" /> </a> </td>
                            <td width="25" style="font-size: 0; line-height: 0;">
                                &nbsp;
                            </td>
                            <td width="30"> <a href="https://www.pinterest.com/Cricut"> <img src="https://d2e2oszluhwxlw.cloudfront.net/emails/helper_assets/2021/pinterest.png" alt="Pinterest" border="0" width="26" height="26" style="display: block; margin: 0px; border: none;" /> </a> </td>
                            <td width="25" style="font-size: 0; line-height: 0;">
                                &nbsp;
                            </td>
                            <td width="30"> <a href="https://www.youtube.com/user/OfficialCricut"> <img src="https://d2e2oszluhwxlw.cloudfront.net/emails/helper_assets/2021/youtube.png" alt="YouTube" border="0" width="26" height="26" style="display: block; margin: 0px; border: none;" /> </a> </td>
                            <td width="25" style="font-size: 0; line-height: 0;">
                                &nbsp;
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>

            <!--End Social Icons-->
            </td>
            </tr>

            <!--End Social Icons-->

            </td>
            </tr>

            <!--End Copyright and Address-->
            <tr>
                <td height="50">&nbsp;</td>
            </tr>
            
            <tr bgcolor="ffffff" style="background-color: #ffffff">
                <td align="center">
                    <p> Made with ❤️ in Addis Abeba</p>
                </td>
            </tr>

            <!--End Footer-->
            </tbody>
        </table>

        <!--[if (gte mso 9)|(IE)]> </td> </tr> </table> <![endif]-->
    </div>
</center>
</body>
</html>
`;
};

// async..await is not allowed in global scope, must use a wrapper
const sender = async ({ list, sessionId }) => {

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "playkuasnow@gmail.com",
      pass: "This1Is2A3Strong4Password!",
    },
  });

  let body = html({ sessionId });

  let calendar = await getCalendar({sessionId});

  // notify users for our
  list.forEach((player) => {
    if (player.id) {
      notify({type: "SessionInvite", entityId: sessionId, playerId: player.id});
      addAsPending({sessionId, playerId: player.id })
    }
  });

  list.forEach(async (player) => {
    let options = mailOptionGenerator({
      to: player.email ? player.email : player,
      body: body,
      calendar: calendar,
    });
    try {
      await sendMail({ transporter, options });
    } catch (mailError) {
      console.error("Error sending mail!", mailError);
    }
  });
};

const getCalendar = async ({sessionId}) => {

  const results = await database.findSessionBySessionId(sessionId);
  const pitchData = await database.findPitchesById(results.pitch_id);
  let start = `${getDate(results.date.toISOString())}T${results.start_time}.000`;
  let end = `${getDate(results.date.toISOString())}T${results.end_time}.000`;

  const calendar = ical({ name: "Kuaas Inc Calendar" });

  calendar.createEvent({
    start: new Date(start),
    end: new Date(end),
    timezone: "Africa/Addis_Ababa", // TODO fetch time zone from pitch data
    summary: results.name,
    description: `Join ${results.name} session for a quick game ;)`,
    location: `${pitchData.city}, ${pitchData.country}`,
    url: `https://kuaas.com/sessions/${sessionId}`,
    organizer: { name: "Kuas Inc", email: "playkuasnow@gmail.com" },
  });

  return calendar;
}

const mailOptionGenerator = ({ to, body, calendar }) => {
  return {
    from: '"Kuaas Inc. " <playkuasnow@gmail.com>',
    to: [to],
    subject: "Hello Player! ⚽",
    html: body,
    icalEvent: {
      filename: "invitation.ics",
      method: "request",
      content: calendar.toString(),
    },
  };
};

const sendMail = async ({ transporter, options }) => {
  try {
    let info = await transporter.sendMail(options);
    console.log("info ", info);
  } catch (err) {
    console.error("SMTP issue ", err);
  }
};

module.exports = {
  sender,
};
