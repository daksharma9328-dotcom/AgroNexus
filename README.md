# AgroNexus

AgroNexus is a Smart India Hackathon 2026 frontend prototype for SIH26032. It demonstrates a clearer agricultural procurement journey: planned slot booking, a digital token, simulated queue visibility, and procurement tracking.

## Prototype scope

This is a frontend-only demo. All farmer details, centres, bookings, capacity figures, tokens, queue data, and status updates are fictional local React state. It has no authentication service, backend, APIs, government integration, real-time server, payment flow, or real QR code.

## Technology

- React + Vite
- JavaScript
- Tailwind CSS (current Vite plugin integration)

## Important structure

```
src/
  App.jsx       # Screens, shared UI helpers, and local demo state
  main.jsx      # React entry point
  index.css     # Tailwind import and small reusable styles
vite.config.js  # React and Tailwind Vite plugins
```

## Install and run

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (normally `http://localhost:5173`). To make a production build:

```bash
npm run build
```

## Available screens

- `/login` — Farmer login
- `/dashboard` — Farmer dashboard
- `/select-crop` — Crop and quantity selection
- `/select-centre` — Procurement centre selection
- `/select-slot` — Slot selection
- `/confirmation` — Booking confirmation
- `/token` — Digital token
- `/queue` — Simulated live queue
- `/tracking` — Procurement status timeline
- `/operator` — Procurement centre operator dashboard

## Test the farmer flow

1. Start at `/login`, enter any 10-digit mobile number, and select **Login to dashboard**.
2. On the dashboard select **Book new slot**.
3. Choose a crop, quantity, and unit, then continue.
4. Choose a non-full centre, then choose an available slot.
5. Review and select **Confirm booking**. A local demo token is generated.
6. Open the token and then **View live queue**.
7. Select **Demo refresh / simulate update** to show the simulated queue changing.
8. Open **Track procurement** to see the status timeline.
9. Use **Reset demo** in the desktop header to restore default local data.

## Test the operator dashboard

1. From login select **Open centre operator demo**, or visit `/operator`.
2. Inspect today’s fictional booking list and the workload summary.
3. Change any row’s status using its dropdown. The local table updates immediately.
4. Use **Open farmer view** to return to the farmer experience.

## Future backend stage

The UI can later connect to APIs for authentication, centre/slot availability, persisted bookings, QR token validation, notifications, and real-time queue updates. No backend behavior is implied by this prototype.
