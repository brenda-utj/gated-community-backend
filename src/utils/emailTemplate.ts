export const getBaseEmailTemplate = (header: string, content: string, footer: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${header}</h1>
      </div>

      <div style="padding: 30px; background-color: #ffffff;">
        ${content}
      </div>

      <div style="background-color: #f8f9fa; color: #7f8c8d; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;">
        <p style="margin: 0;">${footer}</p>
        <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} Gated Community System</p>
      </div>
    </div>
  `;
};