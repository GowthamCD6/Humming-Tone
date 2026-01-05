const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD
  }
});

exports.sendCustomizeMail = async (data) => {
  const {
    cloth_type,
    variant,
    color,
    material,
    size,
    design_img_path
  } = data;

  const mailOptions = {
    from: `"Humming Tone" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: process.env.ADMIN_EMAIL,

    subject: "New Custom Order – Action Required",

    text: `
New Customization Request Received

Cloth Type: ${cloth_type}
Variant: ${variant}
Color: ${color}
Material: ${material}
Size: ${size}

Design image is attached.
`,

    html: `
      <h2>New Customization Request</h2>
      <ul>
        <li><strong>Cloth Type:</strong> ${cloth_type}</li>
        <li><strong>Variant:</strong> ${variant}</li>
        <li><strong>Color:</strong> ${color}</li>
        <li><strong>Material:</strong> ${material}</li>
        <li><strong>Size:</strong> ${size}</li>
      </ul>
      <p>The design image is attached with this email.</p>
    `,

    attachments: [
      {
        filename: "custom-design.png",
        path: design_img_path
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};
