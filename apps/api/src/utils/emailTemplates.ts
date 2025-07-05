export function generateEmailTemplate({
  subject,
  body,
  buttonText,
  buttonUrl,
  footerNote,
  disclaimer,
}: {
  subject: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  footerNote: string;
  disclaimer: string;
}) {
  return `
  <div style="background-color:#FFEEDB; padding:40px 0; font-family:'Cormorant Garamond', Garamond, Georgia, serif;">
    <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="background-color:#FFEEDB; padding:20px; text-align:center; border-bottom:1px solid #BA3B46;">
          <img src="https://res.cloudinary.com/dw6c7wdbe/image/upload/v1751544773/dark-logo_epm3jo.png" alt="Logo" style="max-height:50px;" />
        </td>
      </tr>
      <tr>
        <td style="padding:30px; color:#000000;">
          <h2 style="margin-top:0; font-size:24px;">${subject}</h2>
          <p style="font-size:16px; line-height:1.5;">${body}</p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${buttonUrl}" style="
              background-color:#BA3B46;
              color:#ffffff;
              padding:0 24px;
              border-radius:20px;
              font-size:16px;
              font-weight:500;
              font-family:'Cormorant SC', serif;
              text-decoration:none;
              display:inline-block;
              height:48px;
              line-height:48px;
            ">${buttonText}</a>
          </div>
          <p style="font-size:14px; color:#555555;">${disclaimer}</p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#BA3B46; color:#ffffff; text-align:center; padding:15px; font-size:12px;">
          ${footerNote}
        </td>
      </tr>
    </table>
  </div>
  `;
}