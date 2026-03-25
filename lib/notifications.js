import { sendWhatsApp } from './api-integrations';

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

  return await sendWhatsApp(phone, template.id, { clientName, params: template.params });
}

// Called when a new public intake is received
export async function notifyNewIntake(caseData) {
  const phone = caseData.client_phone || caseData.intake_data?.phone;
  if (!phone) return { sent: false, reason: 'No phone number' };

  const clientName = caseData.client_name || 'Client';
  return await sendWhatsApp(phone, 'case_received', {
    clientName,
    params: { clientName, message: 'Thank you for submitting your tax assessment. Our team will call you within 24 hours.' },
  });
}
