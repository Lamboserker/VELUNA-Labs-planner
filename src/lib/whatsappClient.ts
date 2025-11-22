type WhatsAppTextPayload = {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: { body: string };
};

const resolveWhatsAppConfig = () => {
  const phoneNumberId = process.env.WABA_PHONE_NUMBER_ID;
  const accessToken = process.env.WABA_ACCESS_TOKEN;

  const missingBaseVars = [
    !phoneNumberId && 'WABA_PHONE_NUMBER_ID',
    !accessToken && 'WABA_ACCESS_TOKEN',
  ].filter(Boolean);

  if (missingBaseVars.length > 0) {
    throw new Error(`Missing WhatsApp Cloud API env vars: ${missingBaseVars.join(', ')}`);
  }

  return {
    phoneNumberId: phoneNumberId as string,
    accessToken: accessToken as string,
  };
};

export async function sendWhatsAppTextMessage(to: string, body: string): Promise<unknown> {
  if (!to) {
    throw new Error('Missing WhatsApp recipient.');
  }

  const payload: WhatsAppTextPayload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  };

  const { phoneNumberId, accessToken } = resolveWhatsAppConfig();
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('WhatsApp API responded with an error', {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(`WhatsApp API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Sending WhatsApp message failed', error);
    throw error instanceof Error ? error : new Error('Sending WhatsApp message failed');
  }
}
