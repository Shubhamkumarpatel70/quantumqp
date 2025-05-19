// emailTemplates.js
export const textEmailTemplate = (name, otp, expirationMinutes) => {
  return `Hello ${name},

Your OTP code is ${otp}. It will expire in ${expirationMinutes} minutes.

If you did not request this, please ignore this email.

Thank you,
The Team`;
};

export const htmlEmailTemplate = (name, otp, expirationMinutes) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${name},</h2>
      <p>Your OTP code is <strong>${otp}</strong>. It will expire in <strong>${expirationMinutes} minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br />
      <p>Thank you,</p>
      <p>The Team</p>
    </div>
  `;
};
