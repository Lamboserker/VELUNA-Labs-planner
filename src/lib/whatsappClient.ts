const phoneNumberId = process.env.WABA_PHONE_NUMBER_ID;
const accessToken = process.env.WABA_ACCESS_TOKEN;

const missingBaseVars = [
  !phoneNumberId && 'WABA_PHONE_NUMBER_ID',
  !accessToken && 'WABA_ACCESS_TOKEN',
].filter(Boolean);

if (missingBaseVars.length > 0) {
  throw new Error(`Missing WhatsApp Cloud API env vars: ${missingBaseVars.join(', ')}`);
}

const resolvedPhoneNumberId = phoneNumberId as string;
const resolvedAccessToken = accessToken as string;

type WhatsAppTextPayload = {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: { body: string };
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

  const url = `https://graph.facebook.com/v21.0/${resolvedPhoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resolvedAccessToken}`,
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
