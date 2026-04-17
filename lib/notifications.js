import { sendWhatsApp, sendEmail } from './api-integrations';

// Called when case status changes — sends WhatsApp if configured
export async function notifyStatusChange(caseData, newStatus) {
  const phone = caseData.client_phone || caseData.intake_data?.phone;
  if (!phone) return { sent: false, reason: 'No phone number' };

  const clientName = caseData.client_name || caseData.intake_data?.name || 'Client';
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nri-tax-app.vercel.app'}/portal?ref=${caseData.portal_token}`;

  const templates = {
    intake: { id: 'case_received', params: { clientName, message: 'Your case has been received. Our team will review and call you within 24 hours.' } },
    in_progress: { id: 'case_progress', params: { clientName, message: 'Your case is now being analyzed by our AI modules. Track progress here: ' + portalUrl } },
    review: { id: 'case_review', params: { clientName, message: 'Your case analysis is complete and under expert review.' } },
    findings_ready: { id: 'findings_ready', params: { clientName, message: 'Your tax diagnostic findings are ready! View them here: ' + portalUrl } },
    filing: { id: 'filing_progress', params: { clientName, message: 'Your ITR is being prepared for filing.' } },
    filed: { id: 'case_filed', params: { clientName, message: 'Great news! Your ITR has been filed successfully. View details: ' + portalUrl } },
  };

  const template = templates[newStatus];
  if (!template) return { sent: false, reason: 'No template for status: ' + newStatus };

  const whatsappResult = await sendWhatsApp(phone, template.id, { clientName, params: template.params });

  // Also try email notification
  try {
    const clientEmail = caseData.client_email || caseData.intake_data?.email;
    if (clientEmail) {
      await sendEmail(
        clientEmail,
        `Case Update: ${newStatus === 'findings_ready' ? 'Your Tax Diagnostic is Ready' : 'Status Update \u2014 NRI Tax Suite'}`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#C49A3C">NRI Tax Suite \u2014 MKW Advisors</h2>
          <p>Dear ${clientName},</p>
          <p>${templates[newStatus]?.params?.message || 'Your case status has been updated.'}</p>
          <p><a href="${portalUrl}" style="display:inline-block;padding:12px 24px;background:#C49A3C;color:#1a1a1a;text-decoration:none;border-radius:8px;font-weight:bold">Track Your Case</a></p>
          <p style="color:#999;font-size:12px;margin-top:30px">MKW Advisors \u00b7 CA \u00b7 CS \u00b7 CMA<br>This is an automated notification.</p>
        </div>`
      );
    }
  } catch (e) {
    // Email is optional — don't fail if not configured
  }

  return whatsappResult;
}

// Called when a new public intake is received
export async function notifyNewIntake(caseData) {
  const phone = caseData.client_phone || caseData.intake_data?.phone;
  if (!phone) return { sent: false, reason: 'No phone number' };

  const clientName = caseData.client_name || 'Client';
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nri-tax-app.vercel.app'}/portal?ref=${caseData.portal_token}`;

  return await sendWhatsApp(phone, 'case_received', {
    clientName,
    params: {
      clientName,
      message: `Thank you for submitting your tax assessment, ${clientName}. Our team will review and call you within 24 hours.\n\nTrack your case anytime: ${portalUrl}\n\nSave this link — you'll need it to check your case progress.`,
    },
  });
}
