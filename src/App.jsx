import { useEffect, useRef, useState } from 'react'
import agroNexusLogo from './assets/agro-nexus-logo.svg'
import hiBookingVoice from './assets/voice/hi-booking.wav'
import hiQueueVoice from './assets/voice/hi-queue.wav'
import hiTurnVoice from './assets/voice/hi-turn.wav'
import hiYourTurnVoice from './assets/voice/hi-yourturn.wav'
import hiTestVoice from './assets/voice/hi-test.wav'
import paBookingVoice from './assets/voice/pa-booking.wav'
import paQueueVoice from './assets/voice/pa-queue.wav'
import paTurnVoice from './assets/voice/pa-turn.wav'
import paYourTurnVoice from './assets/voice/pa-yourturn.wav'
import paTestVoice from './assets/voice/pa-test.wav'
import { cloudSyncEnabled, loadCloudState, saveCloudState, subscribeToCloudState } from './sync'

const centres = [
  { id: 'c1', name: 'Greenfield Procurement Centre', location: 'Madhopur', distance: '4.2 km', availability: 18, queue: 12, wait: 35, status: 'Open', recommended: true },
  { id: 'c2', name: 'Kisan Seva Collection Point', location: 'Rampur', distance: '7.8 km', availability: 6, queue: 24, wait: 70, status: 'Busy', recommended: false },
  { id: 'c3', name: 'Sona Mandi Procurement Hub', location: 'Lakshmi Nagar', distance: '11.5 km', availability: 0, queue: 38, wait: 120, status: 'Full', recommended: false },
]
const slots = [
  { id: 's1', date: '18 September 2026', time: '09:00 – 10:00', remaining: 8, available: true },
  { id: 's2', date: '18 September 2026', time: '11:00 – 12:00', remaining: 3, available: true },
  { id: 's3', date: '18 September 2026', time: '14:00 – 15:00', remaining: 0, available: false },
  { id: 's4', date: '19 September 2026', time: '10:00 – 11:00', remaining: 11, available: true },
]
const initialBookings = [
  { id: 1, token: 'AN-1841', farmer: 'Ramesh Kumar', crop: 'Wheat', quantity: '25 quintals', slot: '09:00 – 10:00', status: 'Booked', centreId: 'c1' },
  { id: 2, token: 'AN-1842', farmer: 'Sunita Devi', crop: 'Paddy', quantity: '18 quintals', slot: '09:00 – 10:00', status: 'In progress', centreId: 'c1' },
  { id: 3, token: 'AN-1843', farmer: 'Mohan Lal', crop: 'Maize', quantity: '12 quintals', slot: '11:00 – 12:00', status: 'Booked', centreId: 'c2' },
]

const translations = {
  en: {
    language: 'Language', farmer: 'Farmer', operator: 'Operator', farmerView: 'Farmer view', liveQueue: 'Live queue', trackStatus: 'Track status', resetDemo: 'Reset demo',
    smart: 'Smart Procurement, Less Waiting', centreOperator: 'Centre Operator', goDashboard: 'Go to dashboard',
    sihPrototype: 'SIH 2026 prototype', hero: 'Procurement that respects a farmer’s time.', heroText: 'Plan arrivals, receive a digital token, and follow a clear procurement journey — all in one simple interface.',
    demoMode: 'Demo mode: all bookings, queues, and tokens are fictional local data.', farmerLogin: 'Farmer login', mobileHint: 'Use any valid 10-digit number for this demo.', mobile: 'Mobile number', login: 'Login to dashboard →', operatorDemo: 'Open centre operator demo', invalidMobile: 'Enter a 10-digit demo mobile number.',
    farmerDashboard: 'Farmer dashboard', namaste: 'Namaste, Ramesh Kumar', upcomingReady: 'Your upcoming procurement is ready to plan.', tokenNumber: 'Token number', demoToken: 'Demo token', queuePosition: 'Queue position', farmersAhead: 'farmers ahead', estimatedWait: 'Estimated wait', simulatedEstimate: 'Simulated estimate', procurementStatus: 'Procurement status', booked: 'Booked', awaitingCheckin: 'Awaiting check-in', upcomingSlot: 'Upcoming slot', fictionalBooking: 'Fictional demo booking', cropQuantity: 'Crop & quantity', procurementCentre: 'Procurement centre', dateTime: 'Date & time', queue: 'Queue', approx: 'approx.', bookNewSlot: 'Book new slot', viewToken: 'View digital token', trackProcurement: 'Track procurement', notifications: 'Notifications', plannedArrival: 'Your planned arrival is', queueSimulated: 'Queue values are simulated for this prototype.', openLiveQueue: 'Open live queue →', tokenStatus: 'Token status', queueStatus: 'Queue status', bookedStatus: 'Booked', checkedInStatus: 'Checked in', waitingStatus: 'Waiting in queue', yourTurnStatus: 'Your turn', processingStatus: 'Procurement in progress', completedStatus: 'Completed', peopleAhead: 'People ahead', queueProgress: 'Queue progress', nextAction: 'Next action', reachCentre: 'Please reach the procurement centre when your turn is near.', demoControl: 'Demo control', advanceQueue: 'Advance queue', markCheckedIn: 'Mark checked in', markCompleted: 'Mark completed', statusUpdated: 'Status updated locally', currentToken: 'Current token',
    newBooking1: 'New booking · Step 1 of 3', whatBringing: 'What are you bringing?', selectCropText: 'Select the crop and expected quantity for your visit.', crop: 'Crop', quantity: 'Quantity', unit: 'Unit', quintals: 'quintals', kilograms: 'kilograms', bags: 'bags', continueCentre: 'Continue to centre →', cancel: 'Cancel', cropError: 'Choose a crop and enter a quantity greater than zero.',
    newBooking2: 'New booking · Step 2 of 3', chooseCentre: 'Choose a procurement centre', centreText: 'Compare nearby centres by distance, queue, waiting time and available slots.', discoveryHint: 'Pick a centre that fits your time and availability.', recommended: 'Recommended', estimatedWait: 'Estimated wait', minutes: 'min', distanceLabel: 'Distance', selectedCentre: 'Selected centre', nearby: 'Nearby', availableNow: 'available now', routeHint: 'Distance shown is demo data; live location can be connected later.', unavailableReason: 'No slots available today', continueSlots: 'Continue to slots →', back: 'Back', farmers: 'farmers', slots: 'slots', todayAvailability: 'Today’s availability', currentQueue: 'Current queue',
    newBooking3: 'New booking · Step 3 of 3', selectSlot: 'Select an available slot', scheduleSim: 'This schedule is simulated for the demo.', bookingFor: 'Booking for', selectDate: 'Select date', selectTime: 'Select time slot', tapSlot: 'Tap a slot to select', available: 'available', almostFull: 'Almost full', slotFull: 'Slot full', full: 'Full', selected: 'Selected', bookingSummary: 'Booking summary', date: 'Date', time: 'Time', placesLeft: 'places left', reviewBooking: 'Review booking →',
    review: 'Review booking', confirmArrival: 'Confirm your planned arrival', tokenLocal: 'This creates a local demo token only; it is not a government-system booking.', farmer: 'Farmer', centre: 'Centre', slot: 'Slot', confirmBooking: 'Confirm booking', backEdit: 'Back / edit',
    digitalToken: 'Digital token', tokenReady: 'Your demo token is ready', tokenHelp: 'Keep this screen handy when demonstrating the planned arrival journey.', tokenLabel: 'TOKEN NUMBER', qrPlaceholder: 'QR-style visual placeholder only — not a real scannable QR code.', backDashboard: 'Back to dashboard',
    queueEyebrow: 'Live queue', simulatedQueue: 'Your simulated queue status', queueText: 'This screen demonstrates how future live updates could appear. No real-time service is connected.', position: 'Position', servingNow: 'Serving now', waiting: 'Queue status: Waiting in queue', lastUpdated: 'Last updated', refresh: 'Demo refresh / simulate update', updatedJustNow: 'Updated just now',
    tracking: 'Procurement tracking', journey: 'Follow your procurement journey', trackingText: 'The current stage is a local prototype status.', bookingDetails: 'Booking details', currentStatus: 'Current status', pendingNext: 'Pending next step.', confirmedArrival: 'Booking confirmed — planned arrival is set.',
    operatorEyebrow: 'Centre operator', operatorTitle: 'Greenfield Procurement Centre', operatorText: 'Operational figures and booking records below are fictional, local demo data.', totalCapacity: 'Total daily capacity', demoPlan: 'Demo plan', todayBookings: 'Today’s bookings', pendingCompleted: 'Pending / completed', bookingList: 'Today’s booking list', controls: 'Use these local-only controls to demonstrate status updates.', openFarmer: 'Open farmer view', action: 'Action', status: 'Status',
    open: 'Open', busy: 'Busy', full: 'Full', checkedIn: 'Checked in', inProgress: 'In progress', completed: 'Completed', slotBooked: 'Slot Booked', farmerCheckedIn: 'Farmer Checked In', waitingQueue: 'Waiting in Queue', procurementProgress: 'Procurement In Progress', procurementCompleted: 'Procurement Completed',
    approxSymbol: 'approx.', alertTitle: 'Farmer alerts', alertChannel: 'SMS / Push simulation', testAlert: 'Test alert', testVoice: 'Test voice alert', listen: 'Listen', bookingAlert: 'Your booking is confirmed. Keep your phone ready for queue updates.', queueAlert: 'Queue update: {ahead} farmers are ahead of you. Estimated wait: {wait} minutes.', turnAlert: 'Your turn is approaching. Please stay ready at the procurement centre.', yourTurnAlert: 'It is your turn now. Please proceed to the procurement centre.', voiceUnavailable: 'Voice alerts are not supported by this browser.', voiceReady: 'Voice ready', voiceSpeaking: 'Speaking…', voiceError: 'Voice could not start. Check your browser/device speech settings.', voiceNoVoice: 'No speech voice is available on this device.', alertJustNow: 'Just now', noAlerts: 'No alerts yet.',
    operatorLive:'Live operations', centreStatus:'Centre status', capacityUsed:'Capacity used', remainingCapacity:'remaining capacity', slotUtilization:'Slot utilization', queueHealth:'Queue health', healthy:'Healthy', attention:'Needs attention', currentServing:'Currently serving', callNext:'Call next token', holdQueue:'Hold queue', resumeQueue:'Resume queue', nextToken:'Next token', noNext:'No pending token', checkedInCount:'Checked-in', processingCount:'Processing', completedCount:'Completed', operationalNote:'Demo controls simulate how a procurement centre can manage arrivals in real time.', queueControl:'Queue control', markInProgress:'Start processing', markDone:'Complete procurement', quickActions:'Quick actions', allBookings:'All bookings', activeOnly:'Active only', searchFarmer:'Search farmer or token', filter:'Filter', syncStatus:'Offline demo sync ready', syncHint:'Changes are stored locally and can sync to the server when online.', centreOpen:'Centre open', centreBusy:'Centre busy', centreClosed:'Centre closed', nextArrival:'Next scheduled arrival', noActiveBookings:'No active bookings', called:'Called', callSuccess:'Token called successfully', holdSuccess:'Queue is on hold', resumeSuccess:'Queue resumed', operatorBadge:'OPERATOR DEMO', selectOperatorCentre:'Select procurement centre', onlineCloud:'Online cloud sync', localMode:'Offline / local mode', syncing:'Syncing…', synced:'Synced just now', syncNow:'Sync now', syncPending:'Changes waiting to sync', syncOffline:'Offline — changes saved locally', syncCloudNotConfigured:'Cloud sync not configured yet', syncFailed:'Cloud sync failed — local mode continues', sharedDemo:'Shared demo state', autoSync:'Auto-sync enabled when online', onlineReady:'Online sync ready',

    wheat: 'Wheat', paddy: 'Paddy', maize: 'Maize', mustard: 'Mustard', chickpea: 'Chickpea',
  },
  hi: {
    language: 'भाषा', farmer: 'किसान', operator: 'ऑपरेटर', farmerView: 'किसान व्यू', liveQueue: 'लाइव कतार', trackStatus: 'स्थिति देखें', resetDemo: 'डेमो रीसेट', smart: 'स्मार्ट खरीद, कम इंतज़ार', centreOperator: 'केंद्र ऑपरेटर', goDashboard: 'डैशबोर्ड पर जाएँ',
    sihPrototype: 'SIH 2026 प्रोटोटाइप', hero: 'किसान के समय का सम्मान करने वाली खरीद।', heroText: 'आगमन की योजना बनाएँ, डिजिटल टोकन पाएँ और पूरी खरीद प्रक्रिया एक ही सरल इंटरफेस में देखें।', demoMode: 'डेमो मोड: सभी बुकिंग, कतार और टोकन काल्पनिक स्थानीय डेटा हैं।', farmerLogin: 'किसान लॉगिन', mobileHint: 'इस डेमो के लिए कोई भी सही 10 अंकों का नंबर इस्तेमाल करें।', mobile: 'मोबाइल नंबर', login: 'डैशबोर्ड पर लॉगिन करें →', operatorDemo: 'केंद्र ऑपरेटर डेमो खोलें', invalidMobile: '10 अंकों का डेमो मोबाइल नंबर दर्ज करें।',
    farmerDashboard: 'किसान डैशबोर्ड', namaste: 'नमस्ते, Ramesh Kumar', upcomingReady: 'आपकी आगामी खरीद की योजना तैयार है।', tokenNumber: 'टोकन नंबर', demoToken: 'डेमो टोकन', queuePosition: 'कतार में स्थान', farmersAhead: 'किसान आगे हैं', estimatedWait: 'अनुमानित प्रतीक्षा', simulatedEstimate: 'सिमुलेटेड अनुमान', procurementStatus: 'खरीद स्थिति', booked: 'बुक्ड', awaitingCheckin: 'चेक-इन बाकी', upcomingSlot: 'आगामी स्लॉट', fictionalBooking: 'काल्पनिक डेमो बुकिंग', cropQuantity: 'फसल और मात्रा', procurementCentre: 'खरीद केंद्र', dateTime: 'तारीख और समय', queue: 'कतार', approx: 'लगभग', bookNewSlot: 'नया स्लॉट बुक करें', viewToken: 'डिजिटल टोकन देखें', trackProcurement: 'खरीद ट्रैक करें', notifications: 'सूचनाएँ', plannedArrival: 'आपका नियोजित आगमन है', queueSimulated: 'कतार के आँकड़े इस प्रोटोटाइप के लिए सिमुलेटेड हैं।', openLiveQueue: 'लाइव कतार खोलें →', tokenStatus: 'टोकन स्थिति', queueStatus: 'कतार स्थिति', bookedStatus: 'बुक्ड', checkedInStatus: 'चेक-इन', waitingStatus: 'कतार में प्रतीक्षा', yourTurnStatus: 'आपकी बारी', processingStatus: 'खरीद प्रक्रिया जारी', completedStatus: 'पूरा', peopleAhead: 'आगे किसान', queueProgress: 'कतार प्रगति', nextAction: 'अगला कदम', reachCentre: 'जब आपकी बारी पास हो, कृपया खरीद केंद्र पहुँचें।', demoControl: 'डेमो नियंत्रण', advanceQueue: 'कतार आगे बढ़ाएँ', markCheckedIn: 'चेक-इन करें', markCompleted: 'पूरा करें', statusUpdated: 'स्थिति लोकल रूप से अपडेट हुई', currentToken: 'वर्तमान टोकन',
    newBooking1: 'नई बुकिंग · चरण 1/3', whatBringing: 'आप क्या ला रहे हैं?', selectCropText: 'अपनी फसल और अनुमानित मात्रा चुनें।', crop: 'फसल', quantity: 'मात्रा', unit: 'इकाई', quintals: 'क्विंटल', kilograms: 'किलोग्राम', bags: 'बोरी', continueCentre: 'केंद्र पर जाएँ →', cancel: 'रद्द करें', cropError: 'फसल चुनें और शून्य से अधिक मात्रा दर्ज करें।',
    newBooking2: 'नई बुकिंग · चरण 2/3', chooseCentre: 'खरीद केंद्र चुनें', centreText: 'दूरी, कतार, प्रतीक्षा समय और उपलब्ध स्लॉट देखकर केंद्र चुनें।', discoveryHint: 'अपने समय और उपलब्धता के अनुसार केंद्र चुनें।', recommended: 'अनुशंसित', estimatedWait: 'अनुमानित प्रतीक्षा', minutes: 'मिनट', distanceLabel: 'दूरी', selectedCentre: 'चयनित केंद्र', nearby: 'पास में', availableNow: 'अभी उपलब्ध', routeHint: 'दूरी डेमो डेटा है; बाद में लाइव लोकेशन जोड़ी जा सकती है।', unavailableReason: 'आज कोई स्लॉट उपलब्ध नहीं', continueSlots: 'स्लॉट पर जाएँ →', back: 'वापस', farmers: 'किसान', slots: 'स्लॉट', todayAvailability: 'आज की उपलब्धता', currentQueue: 'वर्तमान कतार',
    newBooking3: 'नई बुकिंग · चरण 3/3', selectSlot: 'उपलब्ध स्लॉट चुनें', scheduleSim: 'यह शेड्यूल डेमो के लिए सिमुलेटेड है।', bookingFor: 'बुकिंग के लिए', selectDate: 'तारीख चुनें', selectTime: 'समय स्लॉट चुनें', tapSlot: 'चुनने के लिए स्लॉट पर टैप करें', available: 'उपलब्ध', almostFull: 'लगभग भर गया', slotFull: 'स्लॉट भरा हुआ', full: 'भरा हुआ', selected: 'चयनित', bookingSummary: 'बुकिंग सारांश', date: 'तारीख', time: 'समय', placesLeft: 'स्थान शेष', reviewBooking: 'बुकिंग देखें →',
    review: 'बुकिंग की समीक्षा', confirmArrival: 'अपने नियोजित आगमन की पुष्टि करें', tokenLocal: 'यह केवल स्थानीय डेमो टोकन बनाता है; यह सरकारी सिस्टम की बुकिंग नहीं है।', farmer: 'किसान', centre: 'केंद्र', slot: 'स्लॉट', confirmBooking: 'बुकिंग की पुष्टि करें', backEdit: 'वापस / संपादित करें',
    digitalToken: 'डिजिटल टोकन', tokenReady: 'आपका डेमो टोकन तैयार है', tokenHelp: 'नियोजित आगमन दिखाते समय इस स्क्रीन को तैयार रखें।', tokenLabel: 'टोकन नंबर', qrPlaceholder: 'QR जैसा विज़ुअल केवल प्लेसहोल्डर है — असली स्कैन करने योग्य QR नहीं।', backDashboard: 'डैशबोर्ड पर वापस',
    queueEyebrow: 'लाइव कतार', simulatedQueue: 'आपकी सिमुलेटेड कतार स्थिति', queueText: 'यह स्क्रीन दिखाती है कि भविष्य में लाइव अपडेट कैसे दिख सकते हैं। कोई रियल-टाइम सेवा जुड़ी नहीं है।', position: 'स्थान', servingNow: 'अभी सेवा', waiting: 'कतार स्थिति: प्रतीक्षा में', lastUpdated: 'अंतिम अपडेट', refresh: 'डेमो रीफ्रेश / अपडेट सिमुलेट करें', updatedJustNow: 'अभी अपडेट हुआ',
    tracking: 'खरीद ट्रैकिंग', journey: 'अपनी खरीद प्रक्रिया देखें', trackingText: 'वर्तमान चरण स्थानीय प्रोटोटाइप स्थिति है।', bookingDetails: 'बुकिंग विवरण', currentStatus: 'वर्तमान स्थिति', pendingNext: 'अगले चरण की प्रतीक्षा।', confirmedArrival: 'बुकिंग की पुष्टि — नियोजित आगमन तय है।',
    operatorEyebrow: 'केंद्र ऑपरेटर', operatorTitle: 'Greenfield Procurement Centre', operatorText: 'नीचे के संचालन आँकड़े और बुकिंग रिकॉर्ड काल्पनिक स्थानीय डेमो डेटा हैं।', totalCapacity: 'दैनिक कुल क्षमता', demoPlan: 'डेमो योजना', todayBookings: 'आज की बुकिंग', pendingCompleted: 'लंबित / पूर्ण', bookingList: 'आज की बुकिंग सूची', controls: 'स्थिति अपडेट दिखाने के लिए इन स्थानीय नियंत्रणों का उपयोग करें।', openFarmer: 'किसान व्यू खोलें', action: 'कार्रवाई', status: 'स्थिति',
    open: 'खुला', busy: 'व्यस्त', full: 'भरा हुआ', checkedIn: 'चेक-इन', inProgress: 'प्रगति में', completed: 'पूर्ण', slotBooked: 'स्लॉट बुक्ड', farmerCheckedIn: 'किसान ने चेक-इन किया', waitingQueue: 'कतार में प्रतीक्षा', procurementProgress: 'खरीद प्रक्रिया जारी', procurementCompleted: 'खरीद पूर्ण',
    approxSymbol: 'लगभग', alertTitle: 'किसान सूचनाएँ', alertChannel: 'SMS / Push सिमुलेशन', testAlert: 'टेस्ट सूचना', testVoice: 'वॉइस अलर्ट टेस्ट करें', listen: 'सुनें', bookingAlert: 'आपकी बुकिंग की पुष्टि हो गई है। कतार अपडेट के लिए फोन तैयार रखें।', queueAlert: 'कतार अपडेट: आपके आगे {ahead} किसान हैं। अनुमानित प्रतीक्षा {wait} मिनट है।', turnAlert: 'आपकी बारी पास आ रही है। खरीद केंद्र पर तैयार रहें।', yourTurnAlert: 'अब आपकी बारी है। कृपया खरीद केंद्र पर जाएँ।', voiceUnavailable: 'इस ब्राउज़र में वॉइस अलर्ट उपलब्ध नहीं है।', voiceReady: 'वॉइस तैयार है', voiceSpeaking: 'बोला जा रहा है…', voiceError: 'वॉइस शुरू नहीं हो सकी। ब्राउज़र/डिवाइस की स्पीच सेटिंग जाँचें।', voiceNoVoice: 'इस डिवाइस पर कोई स्पीच वॉइस उपलब्ध नहीं है।', alertJustNow: 'अभी', noAlerts: 'अभी कोई सूचना नहीं है।',
    operatorLive:'लाइव संचालन', centreStatus:'केंद्र की स्थिति', capacityUsed:'उपयोग की गई क्षमता', remainingCapacity:'बाकी क्षमता', slotUtilization:'स्लॉट उपयोग', queueHealth:'कतार की स्थिति', healthy:'सामान्य', attention:'ध्यान आवश्यक', currentServing:'अभी सेवा में', callNext:'अगला टोकन बुलाएँ', holdQueue:'कतार रोकें', resumeQueue:'कतार शुरू करें', nextToken:'अगला टोकन', noNext:'कोई लंबित टोकन नहीं', checkedInCount:'चेक-इन', processingCount:'प्रोसेसिंग', completedCount:'पूरे हुए', operationalNote:'डेमो नियंत्रण दिखाते हैं कि खरीद केंद्र वास्तविक समय में आने वाले किसानों को कैसे संभाल सकता है।', queueControl:'कतार नियंत्रण', markInProgress:'प्रोसेसिंग शुरू करें', markDone:'खरीद पूरी करें', quickActions:'त्वरित कार्य', allBookings:'सभी बुकिंग', activeOnly:'सिर्फ सक्रिय', searchFarmer:'किसान या टोकन खोजें', filter:'फ़िल्टर', syncStatus:'ऑफलाइन डेमो सिंक तैयार', syncHint:'बदलाव स्थानीय रूप से सेव होते हैं और ऑनलाइन होने पर सर्वर से सिंक किए जा सकते हैं।', centreOpen:'केंद्र खुला है', centreBusy:'केंद्र व्यस्त है', centreClosed:'केंद्र बंद है', nextArrival:'अगला निर्धारित आगमन', noActiveBookings:'कोई सक्रिय बुकिंग नहीं', called:'बुलाया गया', callSuccess:'टोकन सफलतापूर्वक बुलाया गया', holdSuccess:'कतार रोक दी गई', resumeSuccess:'कतार फिर शुरू हो गई', operatorBadge:'ऑपरेटर डेमो', selectOperatorCentre:'खरीद केंद्र चुनें', onlineCloud:'ऑनलाइन क्लाउड सिंक', localMode:'ऑफलाइन / लोकल मोड', syncing:'सिंक हो रहा है…', synced:'अभी सिंक हुआ', syncNow:'अभी सिंक करें', syncPending:'सिंक के लिए बदलाव बाकी हैं', syncOffline:'ऑफलाइन — बदलाव लोकल सेव हैं', syncCloudNotConfigured:'क्लाउड सिंक अभी कॉन्फ़िगर नहीं है', syncFailed:'क्लाउड सिंक विफल — लोकल मोड जारी', sharedDemo:'साझा डेमो स्थिति', autoSync:'ऑनलाइन होने पर ऑटो-सिंक चालू', onlineReady:'ऑनलाइन सिंक तैयार',

    wheat: 'गेहूँ', paddy: 'धान', maize: 'मक्का', mustard: 'सरसों', chickpea: 'चना',
  },
  pa: {
    language: 'ਭਾਸ਼ਾ', farmer: 'ਕਿਸਾਨ', operator: 'ਆਪਰੇਟਰ', farmerView: 'ਕਿਸਾਨ ਵਿਊ', liveQueue: 'ਲਾਈਵ ਕਤਾਰ', trackStatus: 'ਸਥਿਤੀ ਵੇਖੋ', resetDemo: 'ਡੈਮੋ ਰੀਸੈਟ', smart: 'ਸਮਾਰਟ ਖਰੀਦ, ਘੱਟ ਉਡੀਕ', centreOperator: 'ਕੇਂਦਰ ਆਪਰੇਟਰ', goDashboard: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਜਾਓ',
    sihPrototype: 'SIH 2026 ਪ੍ਰੋਟੋਟਾਈਪ', hero: 'ਕਿਸਾਨ ਦੇ ਸਮੇਂ ਦੀ ਕਦਰ ਕਰਨ ਵਾਲੀ ਖਰੀਦ।', heroText: 'ਆਉਣ ਦੀ ਯੋਜਨਾ ਬਣਾਓ, ਡਿਜ਼ਿਟਲ ਟੋਕਨ ਲਵੋ ਅਤੇ ਪੂਰੀ ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਇੱਕ ਸਧਾਰਣ ਇੰਟਰਫੇਸ ਵਿੱਚ ਵੇਖੋ।', demoMode: 'ਡੈਮੋ ਮੋਡ: ਸਾਰੀਆਂ ਬੁਕਿੰਗਾਂ, ਕਤਾਰਾਂ ਅਤੇ ਟੋਕਨ ਕਾਲਪਨਿਕ ਲੋਕਲ ਡਾਟਾ ਹਨ।', farmerLogin: 'ਕਿਸਾਨ ਲੌਗਇਨ', mobileHint: 'ਇਸ ਡੈਮੋ ਲਈ ਕੋਈ ਵੀ ਸਹੀ 10 ਅੰਕਾਂ ਵਾਲਾ ਨੰਬਰ ਵਰਤੋ।', mobile: 'ਮੋਬਾਈਲ ਨੰਬਰ', login: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਲੌਗਇਨ ਕਰੋ →', operatorDemo: 'ਕੇਂਦਰ ਆਪਰੇਟਰ ਡੈਮੋ ਖੋਲ੍ਹੋ', invalidMobile: '10 ਅੰਕਾਂ ਵਾਲਾ ਡੈਮੋ ਮੋਬਾਈਲ ਨੰਬਰ ਦਿਓ।',
    farmerDashboard: 'ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ', namaste: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, Ramesh Kumar', upcomingReady: 'ਤੁਹਾਡੀ ਆਉਣ ਵਾਲੀ ਖਰੀਦ ਦੀ ਯੋਜਨਾ ਤਿਆਰ ਹੈ।', tokenNumber: 'ਟੋਕਨ ਨੰਬਰ', demoToken: 'ਡੈਮੋ ਟੋਕਨ', queuePosition: 'ਕਤਾਰ ਵਿੱਚ ਸਥਾਨ', farmersAhead: 'ਕਿਸਾਨ ਅੱਗੇ ਹਨ', estimatedWait: 'ਅੰਦਾਜ਼ੀ ਉਡੀਕ', simulatedEstimate: 'ਸਿਮੂਲੇਟਡ ਅੰਦਾਜ਼ਾ', procurementStatus: 'ਖਰੀਦ ਸਥਿਤੀ', booked: 'ਬੁਕਡ', awaitingCheckin: 'ਚੈਕ-ਇਨ ਬਾਕੀ', upcomingSlot: 'ਆਉਣ ਵਾਲਾ ਸਲਾਟ', fictionalBooking: 'ਕਾਲਪਨਿਕ ਡੈਮੋ ਬੁਕਿੰਗ', cropQuantity: 'ਫਸਲ ਅਤੇ ਮਾਤਰਾ', procurementCentre: 'ਖਰੀਦ ਕੇਂਦਰ', dateTime: 'ਤਾਰੀਖ ਅਤੇ ਸਮਾਂ', queue: 'ਕਤਾਰ', approx: 'ਲਗਭਗ', bookNewSlot: 'ਨਵਾਂ ਸਲਾਟ ਬੁੱਕ ਕਰੋ', viewToken: 'ਡਿਜ਼ਿਟਲ ਟੋਕਨ ਵੇਖੋ', trackProcurement: 'ਖਰੀਦ ਟ੍ਰੈਕ ਕਰੋ', notifications: 'ਸੂਚਨਾਵਾਂ', plannedArrival: 'ਤੁਹਾਡਾ ਨਿਯਤ ਆਉਣ ਦਾ ਸਮਾਂ', queueSimulated: 'ਕਤਾਰ ਦੇ ਅੰਕੜੇ ਇਸ ਪ੍ਰੋਟੋਟਾਈਪ ਲਈ ਸਿਮੂਲੇਟਡ ਹਨ।', openLiveQueue: 'ਲਾਈਵ ਕਤਾਰ ਖੋਲ੍ਹੋ →', tokenStatus: 'ਟੋਕਨ ਸਥਿਤੀ', queueStatus: 'ਕਤਾਰ ਸਥਿਤੀ', bookedStatus: 'ਬੁਕਡ', checkedInStatus: 'ਚੈਕ-ਇਨ', waitingStatus: 'ਕਤਾਰ ਵਿੱਚ ਉਡੀਕ', yourTurnStatus: 'ਤੁਹਾਡੀ ਵਾਰੀ', processingStatus: 'ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਜਾਰੀ', completedStatus: 'ਪੂਰਾ', peopleAhead: 'ਅੱਗੇ ਕਿਸਾਨ', queueProgress: 'ਕਤਾਰ ਪ੍ਰਗਤੀ', nextAction: 'ਅਗਲਾ ਕਦਮ', reachCentre: 'ਜਦੋਂ ਤੁਹਾਡੀ ਵਾਰੀ ਨੇੜੇ ਹੋਵੇ, ਕਿਰਪਾ ਕਰਕੇ ਖਰੀਦ ਕੇਂਦਰ ਪਹੁੰਚੋ।', demoControl: 'ਡੈਮੋ ਕੰਟਰੋਲ', advanceQueue: 'ਕਤਾਰ ਅੱਗੇ ਵਧਾਓ', markCheckedIn: 'ਚੈਕ-ਇਨ ਕਰੋ', markCompleted: 'ਪੂਰਾ ਕਰੋ', statusUpdated: 'ਸਥਿਤੀ ਲੋਕਲ ਤੌਰ ਤੇ ਅੱਪਡੇਟ ਹੋਈ', currentToken: 'ਮੌਜੂਦਾ ਟੋਕਨ',
    newBooking1: 'ਨਵੀਂ ਬੁਕਿੰਗ · ਪੜਾਅ 1/3', whatBringing: 'ਤੁਸੀਂ ਕੀ ਲਿਆ ਰਹੇ ਹੋ?', selectCropText: 'ਆਪਣੀ ਫਸਲ ਅਤੇ ਅੰਦਾਜ਼ੀ ਮਾਤਰਾ ਚੁਣੋ।', crop: 'ਫਸਲ', quantity: 'ਮਾਤਰਾ', unit: 'ਇਕਾਈ', quintals: 'ਕੁਇੰਟਲ', kilograms: 'ਕਿਲੋਗ੍ਰਾਮ', bags: 'ਬੋਰੀ', continueCentre: 'ਕੇਂਦਰ ਤੇ ਜਾਰੀ ਰੱਖੋ →', cancel: 'ਰੱਦ ਕਰੋ', cropError: 'ਫਸਲ ਚੁਣੋ ਅਤੇ ਜ਼ੀਰੋ ਤੋਂ ਵੱਧ ਮਾਤਰਾ ਦਿਓ।',
    newBooking2: 'ਨਵੀਂ ਬੁਕਿੰਗ · ਪੜਾਅ 2/3', chooseCentre: 'ਖਰੀਦ ਕੇਂਦਰ ਚੁਣੋ', centreText: 'ਦੂਰੀ, ਕਤਾਰ, ਉਡੀਕ ਸਮੇਂ ਅਤੇ ਉਪਲਬਧ ਸਲਾਟਾਂ ਦੇ ਆਧਾਰ ਤੇ ਕੇਂਦਰ ਚੁਣੋ।', discoveryHint: 'ਆਪਣੇ ਸਮੇਂ ਅਤੇ ਉਪਲਬਧਤਾ ਮੁਤਾਬਕ ਕੇਂਦਰ ਚੁਣੋ।', recommended: 'ਸਿਫ਼ਾਰਸ਼ੀ', estimatedWait: 'ਅੰਦਾਜ਼ੀ ਉਡੀਕ', minutes: 'ਮਿੰਟ', distanceLabel: 'ਦੂਰੀ', selectedCentre: 'ਚੁਣਿਆ ਕੇਂਦਰ', nearby: 'ਨੇੜੇ', availableNow: 'ਹੁਣ ਉਪਲਬਧ', routeHint: 'ਦੂਰੀ ਡੈਮੋ ਡਾਟਾ ਹੈ; ਬਾਅਦ ਵਿੱਚ ਲਾਈਵ ਲੋਕੇਸ਼ਨ ਜੋੜੀ ਜਾ ਸਕਦੀ ਹੈ।', unavailableReason: 'ਅੱਜ ਕੋਈ ਸਲਾਟ ਉਪਲਬਧ ਨਹੀਂ', continueSlots: 'ਸਲਾਟਾਂ ਤੇ ਜਾਰੀ ਰੱਖੋ →', back: 'ਵਾਪਸ', farmers: 'ਕਿਸਾਨ', slots: 'ਸਲਾਟ', todayAvailability: 'ਅੱਜ ਦੀ ਉਪਲਬਧਤਾ', currentQueue: 'ਮੌਜੂਦਾ ਕਤਾਰ',
    newBooking3: 'ਨਵੀਂ ਬੁਕਿੰਗ · ਪੜਾਅ 3/3', selectSlot: 'ਉਪਲਬਧ ਸਲਾਟ ਚੁਣੋ', scheduleSim: 'ਇਹ ਸਮਾਂ-ਸੂਚੀ ਡੈਮੋ ਲਈ ਸਿਮੂਲੇਟਡ ਹੈ।', bookingFor: 'ਬੁਕਿੰਗ ਲਈ', selectDate: 'ਤਾਰੀਖ ਚੁਣੋ', selectTime: 'ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ', tapSlot: 'ਚੁਣਨ ਲਈ ਸਲਾਟ ਤੇ ਟੈਪ ਕਰੋ', available: 'ਉਪਲਬਧ', almostFull: 'ਲਗਭਗ ਭਰਿਆ', slotFull: 'ਸਲਾਟ ਭਰਿਆ', full: 'ਭਰਿਆ', selected: 'ਚੁਣਿਆ', bookingSummary: 'ਬੁਕਿੰਗ ਸਾਰਾਂਸ਼', date: 'ਤਾਰੀਖ', time: 'ਸਮਾਂ', placesLeft: 'ਥਾਵਾਂ ਬਾਕੀ', reviewBooking: 'ਬੁਕਿੰਗ ਵੇਖੋ →',
    review: 'ਬੁਕਿੰਗ ਦੀ ਸਮੀਖਿਆ', confirmArrival: 'ਆਪਣੇ ਨਿਯਤ ਆਉਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ', tokenLocal: 'ਇਹ ਸਿਰਫ਼ ਲੋਕਲ ਡੈਮੋ ਟੋਕਨ ਬਣਾਉਂਦਾ ਹੈ; ਇਹ ਸਰਕਾਰੀ ਸਿਸਟਮ ਦੀ ਬੁਕਿੰਗ ਨਹੀਂ ਹੈ।', farmer: 'ਕਿਸਾਨ', centre: 'ਕੇਂਦਰ', slot: 'ਸਲਾਟ', confirmBooking: 'ਬੁਕਿੰਗ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ', backEdit: 'ਵਾਪਸ / ਸੋਧੋ',
    digitalToken: 'ਡਿਜ਼ਿਟਲ ਟੋਕਨ', tokenReady: 'ਤੁਹਾਡਾ ਡੈਮੋ ਟੋਕਨ ਤਿਆਰ ਹੈ', tokenHelp: 'ਨਿਯਤ ਆਉਣ ਦੀ ਪ੍ਰਕਿਰਿਆ ਦਿਖਾਉਂਦੇ ਸਮੇਂ ਇਹ ਸਕ੍ਰੀਨ ਤਿਆਰ ਰੱਖੋ।', tokenLabel: 'ਟੋਕਨ ਨੰਬਰ', qrPlaceholder: 'QR ਵਰਗਾ ਵਿਜ਼ੂਅਲ ਸਿਰਫ਼ ਪਲੇਸਹੋਲਡਰ ਹੈ — ਅਸਲੀ ਸਕੈਨ ਹੋਣ ਵਾਲਾ QR ਨਹੀਂ।', backDashboard: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਵਾਪਸ',
    queueEyebrow: 'ਲਾਈਵ ਕਤਾਰ', simulatedQueue: 'ਤੁਹਾਡੀ ਸਿਮੂਲੇਟਡ ਕਤਾਰ ਸਥਿਤੀ', queueText: 'ਇਹ ਸਕ੍ਰੀਨ ਦਿਖਾਉਂਦੀ ਹੈ ਕਿ ਭਵਿੱਖ ਵਿੱਚ ਲਾਈਵ ਅੱਪਡੇਟ ਕਿਵੇਂ ਦਿਖ ਸਕਦੇ ਹਨ। ਕੋਈ ਰੀਅਲ-ਟਾਈਮ ਸੇਵਾ ਨਹੀਂ ਜੁੜੀ।', position: 'ਸਥਾਨ', servingNow: 'ਹੁਣ ਸੇਵਾ', waiting: 'ਕਤਾਰ ਸਥਿਤੀ: ਉਡੀਕ ਵਿੱਚ', lastUpdated: 'ਆਖਰੀ ਅੱਪਡੇਟ', refresh: 'ਡੈਮੋ ਰਿਫ੍ਰੈਸ਼ / ਅੱਪਡੇਟ ਸਿਮੂਲੇਟ ਕਰੋ', updatedJustNow: 'ਹੁਣੇ ਅੱਪਡੇਟ ਹੋਇਆ',
    tracking: 'ਖਰੀਦ ਟ੍ਰੈਕਿੰਗ', journey: 'ਆਪਣੀ ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਵੇਖੋ', trackingText: 'ਮੌਜੂਦਾ ਪੜਾਅ ਲੋਕਲ ਪ੍ਰੋਟੋਟਾਈਪ ਸਥਿਤੀ ਹੈ।', bookingDetails: 'ਬੁਕਿੰਗ ਵੇਰਵੇ', currentStatus: 'ਮੌਜੂਦਾ ਸਥਿਤੀ', pendingNext: 'ਅਗਲੇ ਪੜਾਅ ਦੀ ਉਡੀਕ।', confirmedArrival: 'ਬੁਕਿੰਗ ਦੀ ਪੁਸ਼ਟੀ — ਨਿਯਤ ਆਉਣ ਦਾ ਸਮਾਂ ਤੈਅ ਹੈ।',
    operatorEyebrow: 'ਕੇਂਦਰ ਆਪਰੇਟਰ', operatorTitle: 'Greenfield Procurement Centre', operatorText: 'ਹੇਠਾਂ ਦਿੱਤੇ ਆਪਰੇਸ਼ਨ ਅੰਕੜੇ ਅਤੇ ਬੁਕਿੰਗ ਰਿਕਾਰਡ ਕਾਲਪਨਿਕ ਲੋਕਲ ਡੈਮੋ ਡਾਟਾ ਹਨ।', totalCapacity: 'ਰੋਜ਼ਾਨਾ ਕੁੱਲ ਸਮਰੱਥਾ', demoPlan: 'ਡੈਮੋ ਯੋਜਨਾ', todayBookings: 'ਅੱਜ ਦੀਆਂ ਬੁਕਿੰਗਾਂ', pendingCompleted: 'ਬਾਕੀ / ਪੂਰੀਆਂ', bookingList: 'ਅੱਜ ਦੀ ਬੁਕਿੰਗ ਸੂਚੀ', controls: 'ਸਥਿਤੀ ਅੱਪਡੇਟ ਦਿਖਾਉਣ ਲਈ ਇਹ ਲੋਕਲ ਕੰਟਰੋਲ ਵਰਤੋ।', openFarmer: 'ਕਿਸਾਨ ਵਿਊ ਖੋਲ੍ਹੋ', action: 'ਕਾਰਵਾਈ', status: 'ਸਥਿਤੀ',
    open: 'ਖੁੱਲ੍ਹਾ', busy: 'ਵਿਆਸਤ', full: 'ਭਰਿਆ', checkedIn: 'ਚੈਕ-ਇਨ', inProgress: 'ਜਾਰੀ', completed: 'ਪੂਰਾ', slotBooked: 'ਸਲਾਟ ਬੁਕਡ', farmerCheckedIn: 'ਕਿਸਾਨ ਨੇ ਚੈਕ-ਇਨ ਕੀਤਾ', waitingQueue: 'ਕਤਾਰ ਵਿੱਚ ਉਡੀਕ', procurementProgress: 'ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਜਾਰੀ', procurementCompleted: 'ਖਰੀਦ ਪੂਰੀ',
    approxSymbol: 'ਲਗਭਗ', alertTitle: 'ਕਿਸਾਨ ਸੂਚਨਾਵਾਂ', alertChannel: 'SMS / Push ਸਿਮੂਲੇਸ਼ਨ', testAlert: 'ਟੈਸਟ ਸੂਚਨਾ', testVoice: 'ਵੌਇਸ ਅਲਰਟ ਟੈਸਟ ਕਰੋ', listen: 'ਸੁਣੋ', bookingAlert: 'ਤੁਹਾਡੀ ਬੁਕਿੰਗ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ ਹੈ। ਕਤਾਰ ਅੱਪਡੇਟ ਲਈ ਆਪਣਾ ਫੋਨ ਤਿਆਰ ਰੱਖੋ।', queueAlert: 'ਕਤਾਰ ਅੱਪਡੇਟ: ਤੁਹਾਡੇ ਅੱਗੇ {ahead} ਕਿਸਾਨ ਹਨ। ਅੰਦਾਜ਼ੀ ਉਡੀਕ {wait} ਮਿੰਟ ਹੈ।', turnAlert: 'ਤੁਹਾਡੀ ਵਾਰੀ ਨੇੜੇ ਆ ਰਹੀ ਹੈ। ਖਰੀਦ ਕੇਂਦਰ ਤੇ ਤਿਆਰ ਰਹੋ।', yourTurnAlert: 'ਹੁਣ ਤੁਹਾਡੀ ਵਾਰੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਖਰੀਦ ਕੇਂਦਰ ਤੇ ਜਾਓ।', voiceUnavailable: 'ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਵੌਇਸ ਅਲਰਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।', voiceReady: 'ਵੌਇਸ ਤਿਆਰ ਹੈ', voiceSpeaking: 'ਬੋਲਿਆ ਜਾ ਰਿਹਾ ਹੈ…', voiceError: 'ਵੌਇਸ ਸ਼ੁਰੂ ਨਹੀਂ ਹੋ ਸਕੀ। ਬ੍ਰਾਊਜ਼ਰ/ਡਿਵਾਈਸ ਦੀ ਸਪੀਚ ਸੈਟਿੰਗ ਜਾਂਚੋ।', voiceNoVoice: 'ਇਸ ਡਿਵਾਈਸ ਤੇ ਕੋਈ ਸਪੀਚ ਵੌਇਸ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।', alertJustNow: 'ਹੁਣੇ', noAlerts: 'ਅਜੇ ਕੋਈ ਸੂਚਨਾ ਨਹੀਂ ਹੈ।',
    operatorLive:'ਲਾਈਵ ਕਾਰਵਾਈ', centreStatus:'ਕੇਂਦਰ ਦੀ ਸਥਿਤੀ', capacityUsed:'ਵਰਤੀ ਸਮਰੱਥਾ', remainingCapacity:'ਬਾਕੀ ਸਮਰੱਥਾ', slotUtilization:'ਸਲਾਟ ਵਰਤੋਂ', queueHealth:'ਕਤਾਰ ਦੀ ਸਥਿਤੀ', healthy:'ਠੀਕ', attention:'ਧਿਆਨ ਦੀ ਲੋੜ', currentServing:'ਇਸ ਵੇਲੇ ਸੇਵਾ ਵਿੱਚ', callNext:'ਅਗਲਾ ਟੋਕਨ ਬੁਲਾਓ', holdQueue:'ਕਤਾਰ ਰੋਕੋ', resumeQueue:'ਕਤਾਰ ਚਲਾਓ', nextToken:'ਅਗਲਾ ਟੋਕਨ', noNext:'ਕੋਈ ਬਕਾਇਆ ਟੋਕਨ ਨਹੀਂ', checkedInCount:'ਚੈਕ-ਇਨ', processingCount:'ਪ੍ਰੋਸੈਸਿੰਗ', completedCount:'ਪੂਰੇ ਹੋਏ', operationalNote:'ਡੈਮੋ ਕੰਟਰੋਲ ਦਿਖਾਉਂਦੇ ਹਨ ਕਿ ਖਰੀਦ ਕੇਂਦਰ ਰੀਅਲ ਟਾਈਮ ਵਿੱਚ ਆਉਣ ਵਾਲੇ ਕਿਸਾਨਾਂ ਨੂੰ ਕਿਵੇਂ ਸੰਭਾਲ ਸਕਦਾ ਹੈ।', queueControl:'ਕਤਾਰ ਕੰਟਰੋਲ', markInProgress:'ਪ੍ਰੋਸੈਸਿੰਗ ਸ਼ੁਰੂ ਕਰੋ', markDone:'ਖਰੀਦ ਪੂਰੀ ਕਰੋ', quickActions:'ਤੁਰੰਤ ਕਾਰਵਾਈ', allBookings:'ਸਾਰੀਆਂ ਬੁਕਿੰਗਾਂ', activeOnly:'ਸਿਰਫ਼ ਸਰਗਰਮ', searchFarmer:'ਕਿਸਾਨ ਜਾਂ ਟੋਕਨ ਖੋਜੋ', filter:'ਫਿਲਟਰ', syncStatus:'ਆਫਲਾਈਨ ਡੈਮੋ ਸਿੰਕ ਤਿਆਰ', syncHint:'ਬਦਲਾਅ ਲੋਕਲ ਤੌਰ ਤੇ ਸੇਵ ਹੁੰਦੇ ਹਨ ਅਤੇ ਆਨਲਾਈਨ ਹੋਣ ਤੇ ਸਰਵਰ ਨਾਲ ਸਿੰਕ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ।', centreOpen:'ਕੇਂਦਰ ਖੁੱਲ੍ਹਾ ਹੈ', centreBusy:'ਕੇਂਦਰ ਵਿਅਸਤ ਹੈ', centreClosed:'ਕੇਂਦਰ ਬੰਦ ਹੈ', nextArrival:'ਅਗਲਾ ਨਿਰਧਾਰਤ ਆਗਮਨ', noActiveBookings:'ਕੋਈ ਸਰਗਰਮ ਬੁਕਿੰਗ ਨਹੀਂ', called:'ਬੁਲਾਇਆ ਗਿਆ', callSuccess:'ਟੋਕਨ ਸਫਲਤਾਪੂਰਵਕ ਬੁਲਾਇਆ ਗਿਆ', holdSuccess:'ਕਤਾਰ ਰੋਕ ਦਿੱਤੀ ਗਈ', resumeSuccess:'ਕਤਾਰ ਮੁੜ ਚਾਲੂ ਹੋ ਗਈ', operatorBadge:'ਓਪਰੇਟਰ ਡੈਮੋ', selectOperatorCentre:'ਖਰੀਦ ਕੇਂਦਰ ਚੁਣੋ', onlineCloud:'ਆਨਲਾਈਨ ਕਲਾਉਡ ਸਿੰਕ', localMode:'ਆਫਲਾਈਨ / ਲੋਕਲ ਮੋਡ', syncing:'ਸਿੰਕ ਹੋ ਰਿਹਾ ਹੈ…', synced:'ਹੁਣੇ ਸਿੰਕ ਹੋਇਆ', syncNow:'ਹੁਣੇ ਸਿੰਕ ਕਰੋ', syncPending:'ਸਿੰਕ ਲਈ ਬਦਲਾਅ ਬਾਕੀ ਹਨ', syncOffline:'ਆਫਲਾਈਨ — ਬਦਲਾਅ ਲੋਕਲ ਸੇਵ ਹਨ', syncCloudNotConfigured:'ਕਲਾਉਡ ਸਿੰਕ ਹਾਲੇ ਕੌਂਫਿਗਰ ਨਹੀਂ ਹੈ', syncFailed:'ਕਲਾਉਡ ਸਿੰਕ ਅਸਫਲ — ਲੋਕਲ ਮੋਡ ਜਾਰੀ', sharedDemo:'ਸਾਂਝੀ ਡੈਮੋ ਸਥਿਤੀ', autoSync:'ਆਨਲਾਈਨ ਹੋਣ ਤੇ ਆਟੋ-ਸਿੰਕ ਚਾਲੂ', onlineReady:'ਆਨਲਾਈਨ ਸਿੰਕ ਤਿਆਰ',

    wheat: 'ਕਣਕ', paddy: 'ਝੋਨਾ', maize: 'ਮੱਕੀ', mustard: 'ਸਰੋਂ', chickpea: 'ਛੋਲੇ',
  }
}

const statusKey = { Open: 'open', Busy: 'busy', Full: 'full', Booked: 'booked', 'Checked in': 'checkedIn', 'Waiting in Queue': 'waitingStatus', 'Your Turn': 'yourTurnStatus', 'In progress': 'inProgress', Completed: 'completed' }
const statusStyle = { Open: 'bg-emerald-100 text-emerald-800', Busy: 'bg-amber-100 text-amber-800', Full: 'bg-rose-100 text-rose-800', Booked: 'bg-blue-100 text-blue-800', 'Checked in': 'bg-violet-100 text-violet-800', 'Waiting in Queue': 'bg-sky-100 text-sky-800', 'Your Turn': 'bg-rose-100 text-rose-800', 'In progress': 'bg-amber-100 text-amber-800', Completed: 'bg-emerald-100 text-emerald-800' }
const cropKey = { Wheat: 'wheat', Paddy: 'paddy', Maize: 'maize', Mustard: 'mustard', Chickpea: 'chickpea' }
function Badge({ children, t }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[children] || 'bg-slate-100 text-slate-700'}`}>{t(statusKey[children] || children)}</span> }
function Logo({ inverse = false, operator = false, t }) { return <div className="flex min-w-0 items-center gap-2.5"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${inverse ? 'bg-white' : 'bg-mist ring-1 ring-emerald-100'}`}><img className="h-8 w-8" src={agroNexusLogo} alt="AgroNexus logo" /></span><div className="min-w-0 text-left"><b className={`block truncate leading-none ${inverse ? 'text-white' : 'text-forest'}`}>AgroNexus</b>{operator ? <span className={`mt-1 block text-xs font-semibold ${inverse ? 'text-emerald-100' : 'text-leaf'}`}>{t('centreOperator')}</span> : <span className={`mt-1 block truncate text-xs ${inverse ? 'text-emerald-100' : 'text-slate-500'}`}>{t('smart')}</span>}</div></div> }
function LanguageSwitcher({ lang, setLang, t }) { return <label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><span className="hidden sm:inline">{t('language')}:</span><select aria-label={t('language')} value={lang} onChange={e => setLang(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-semibold"><option value="en">English</option><option value="hi">हिन्दी</option><option value="pa">ਪੰਜਾਬੀ</option></select></label> }
function SyncPill({ syncMode, online, pendingSync, syncNow, t }) { const label = syncMode === 'cloud' ? (pendingSync ? t('syncPending') : online ? t('onlineCloud') : t('syncOffline')) : online ? t('onlineReady') : t('localMode'); return <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"><span className={`h-2 w-2 rounded-full ${online && syncMode === 'cloud' ? 'bg-emerald-500' : online ? 'bg-sky-500' : 'bg-slate-400'}`} /><span>{label}</span>{syncMode === 'cloud' && <button className="ml-1 underline decoration-slate-300 underline-offset-2" onClick={syncNow}>{t('syncNow')}</button>}</div> }
function Layout({ children, go, reset, operator = false, lang, setLang, t, syncMode, online, pendingSync, syncNow }) { return <><header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3"><button aria-label={t('goDashboard')} onClick={() => go(operator ? '/operator' : '/dashboard')}><Logo operator={operator} t={t} /></button><div className="flex items-center gap-2"><SyncPill syncMode={syncMode} online={online} pendingSync={pendingSync} syncNow={syncNow} t={t}/><LanguageSwitcher lang={lang} setLang={setLang} t={t}/><nav className="hidden items-center gap-1 md:flex">{operator ? <button className="btn-secondary" onClick={() => go('/dashboard')}>{t('farmerView')}</button> : <><button className="btn-secondary" onClick={() => go('/queue')}>{t('liveQueue')}</button><button className="btn-secondary" onClick={() => go('/tracking')}>{t('trackStatus')}</button></>}<button className="btn-secondary" onClick={reset}>{t('resetDemo')}</button></nav><button className="btn-secondary md:hidden" onClick={() => go(operator ? '/dashboard' : '/operator')}>{operator ? t('farmer') : t('operator')}</button></div></div></header><main className="mx-auto max-w-6xl px-4 py-7">{children}</main></> }
function PageTitle({ eyebrow, title, text }) { return <div className="mb-6"><p className="text-sm font-bold uppercase tracking-widest text-leaf">{eyebrow}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>{text && <p className="mt-2 max-w-2xl text-slate-600">{text}</p>}</div> }
function Metric({ label, value, note }) { return <div className="card"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}</div> }
function Info({ label, value }) { return <div><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value}</dd></div> }

function getSpeechSupport() {
  if (typeof window === 'undefined') return { supported: false, voices: [] }
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  if (!supported) return { supported: false, voices: [] }
  return { supported: true, voices: window.speechSynthesis.getVoices() || [] }
}

let activeLocalAudio = null

const localVoiceFiles = {
  hi: { bookingAlert: hiBookingVoice, queueAlert: hiQueueVoice, turnAlert: hiTurnVoice, yourTurnAlert: hiYourTurnVoice, test: hiTestVoice },
  pa: { bookingAlert: paBookingVoice, queueAlert: paQueueVoice, turnAlert: paTurnVoice, yourTurnAlert: paYourTurnVoice, test: paTestVoice },
}

function playLocalVoice(lang, voiceKey, onStatus) {
  const src = localVoiceFiles[lang]?.[voiceKey] || localVoiceFiles[lang]?.queueAlert
  if (!src || typeof Audio === 'undefined') {
    onStatus?.('unsupported')
    return false
  }
  try {
    // Keep only one local alert playing at a time; overlapping audio can sound
    // distorted on phone speakers and makes short alerts hard to understand.
    if (activeLocalAudio) {
      activeLocalAudio.pause()
      activeLocalAudio.currentTime = 0
      activeLocalAudio = null
    }

    const audio = new Audio(src)
    activeLocalAudio = audio
    audio.preload = 'auto'
    audio.volume = 0.92
    audio.playbackRate = 1.04
    audio.onplay = () => onStatus?.('speaking')
    audio.onended = () => {
      if (activeLocalAudio === audio) activeLocalAudio = null
      onStatus?.('ready')
    }
    audio.onerror = () => {
      if (activeLocalAudio === audio) activeLocalAudio = null
      onStatus?.('error:audio')
    }
    const promise = audio.play()
    if (promise?.catch) promise.catch(() => {
      if (activeLocalAudio === audio) activeLocalAudio = null
      onStatus?.('error:audio')
    })
    return true
  } catch (error) {
    if (activeLocalAudio) activeLocalAudio = null
    onStatus?.(`error:${error?.message || 'audio failed'}`)
    return false
  }
}

function speakAlert(text, lang, onStatus, voiceKey = 'bookingAlert') {
  // For Hindi/Punjabi, use bundled local voice audio so the demo works even
  // when Chrome/Windows has no Hindi or Punjabi system TTS voice installed.
  if ((lang === 'hi' || lang === 'pa') && localVoiceFiles[lang]?.[voiceKey]) return playLocalVoice(lang, voiceKey, onStatus)

  const support = getSpeechSupport()
  if (!support.supported) {
    onStatus?.('unsupported')
    return false
  }

  const synth = window.speechSynthesis
  const targetLang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-US'
  const voices = support.voices
  const matchingVoice = voices.find(v => v.lang?.toLowerCase() === targetLang.toLowerCase())
    || voices.find(v => v.lang?.toLowerCase().startsWith('en'))

  const utterance = new window.SpeechSynthesisUtterance(String(text))
  utterance.lang = matchingVoice?.lang || targetLang
  if (matchingVoice) utterance.voice = matchingVoice
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1
  utterance.onstart = () => onStatus?.('speaking')
  utterance.onend = () => onStatus?.('ready')
  utterance.onerror = event => onStatus?.(`error:${event.error || 'unknown'}`)

  try {
    synth.cancel()
    if (typeof synth.resume === 'function') synth.resume()
    synth.speak(utterance)
    return true
  } catch (error) {
    onStatus?.(`error:${error?.message || 'speech failed'}`)
    return false
  }
}

function fillAlert(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

const voiceEventsByStatus = { Booked: 'confirmed', 'Waiting in Queue': 'approaching', 'Your Turn': 'your-turn', 'In progress': 'started', Completed: 'completed' }
const voiceMessages = {
  en: { confirmed: 'Your booking is confirmed.', approaching: 'Your turn is approaching. Please be ready.', 'your-turn': 'It is your turn. Please proceed to the procurement centre.', started: 'Your procurement has started.', completed: 'Your procurement is complete.' },
  hi: { confirmed: 'आपकी बुकिंग पक्की हो गई है।', approaching: 'आपकी बारी आने वाली है। कृपया तैयार रहें।', 'your-turn': 'अब आपकी बारी है। कृपया खरीद केंद्र जाएँ।', started: 'आपकी खरीद प्रक्रिया शुरू हो गई है।', completed: 'आपकी खरीद प्रक्रिया पूरी हो गई है।' },
  pa: { confirmed: 'ਤੁਹਾਡੀ ਬੁਕਿੰਗ ਪੱਕੀ ਹੋ ਗਈ ਹੈ।', approaching: 'ਤੁਹਾਡੀ ਵਾਰੀ ਨੇੜੇ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤਿਆਰ ਰਹੋ।', 'your-turn': 'ਹੁਣ ਤੁਹਾਡੀ ਵਾਰੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਖਰੀਦ ਕੇਂਦਰ ਜਾਓ।', started: 'ਤੁਹਾਡੀ ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਸ਼ੁਰੂ ਹੋ ਗਈ ਹੈ।', completed: 'ਤੁਹਾਡੀ ਖਰੀਦ ਪ੍ਰਕਿਰਿਆ ਪੂਰੀ ਹੋ ਗਈ ਹੈ।' },
}
function voiceMessage(lang, event) { return voiceMessages[lang]?.[event] || voiceMessages.en[event] }
function voiceKeyForEvent(event) { return event === 'confirmed' ? 'bookingAlert' : event === 'approaching' ? 'turnAlert' : event === 'your-turn' ? 'yourTurnAlert' : event }

export default function App() {
  const [path, setPath] = useState(window.location.pathname === '/' ? '/login' : window.location.pathname)
  const [lang, setLangState] = useState(() => localStorage.getItem('agronexus-language') || 'en')
  const [booking, setBooking] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agronexus-booking')) || { crop: 'Wheat', quantity: '25', unit: 'quintals', centre: centres[0], slot: slots[0], token: 'AN-1841' } } catch { return { crop: 'Wheat', quantity: '25', unit: 'quintals', centre: centres[0], slot: slots[0], token: 'AN-1841' } }
  })
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agronexus-queue')) || { position: 7, wait: 35, served: 'AN-1834', updated: 'Just now', status: 'Booked', bookingToken: 'AN-1841' } } catch { return { position: 7, wait: 35, served: 'AN-1834', updated: 'Just now', status: 'Booked', bookingToken: 'AN-1841' } }
  })
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('agronexus-bookings'))
      if (!Array.isArray(saved) || saved.length === 0) return initialBookings
      return saved.map(b => ({ ...b, centreId: b.centreId || (b.token === 'AN-1843' ? 'c2' : 'c1') }))
    } catch { return initialBookings }
  })
  const [activeBookingToken, setActiveBookingToken] = useState(() => {
    const savedToken = localStorage.getItem('agronexus-active-booking-token')
    if (savedToken) return savedToken
    try { return JSON.parse(localStorage.getItem('agronexus-booking') || '{}').token || 'AN-1841' } catch { return 'AN-1841' }
  })
  const activeBookingTokenRef = useRef(activeBookingToken)
  useEffect(() => { activeBookingTokenRef.current = activeBookingToken }, [activeBookingToken])
  const [notifications, setNotifications] = useState([])
  useEffect(() => { localStorage.setItem('agronexus-booking', JSON.stringify(booking)) }, [booking])
  useEffect(() => { localStorage.setItem('agronexus-queue', JSON.stringify(queue)) }, [queue])
  useEffect(() => { localStorage.setItem('agronexus-bookings', JSON.stringify(bookings)) }, [bookings])
  useEffect(() => { localStorage.setItem('agronexus-active-booking-token', activeBookingToken) }, [activeBookingToken])
  useEffect(() => {
    if (!bookings.some(item => item.token === activeBookingToken)) setActiveBookingToken(booking.token || 'AN-1841')
  }, [bookings, activeBookingToken, booking.token])
  const addNotification = (key, values = {}, speak = false) => {
    const message = fillAlert(t(key), values)
    setNotifications(list => [{ id: Date.now() + Math.random(), message, time: t('alertJustNow'), channel: t('alertChannel'), voiceKey: key }, ...list].slice(0, 6))
    if (speak) speakAlert(message, langSafe, undefined, key)
  }
  const langSafe = translations[lang] ? lang : 'en'
  const t = key => translations[langSafe][key] ?? translations.en[key] ?? key
  const activeBooking = bookings.find(item => item.token === activeBookingToken) || null
  const activeBookingStatus = activeBooking?.status || queue.status
  const previousActiveStatusRef = useRef(null)
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('agronexus-voice-enabled') === '1')
  const enableVoice = () => {
    const ok = speakAlert(voiceMessage(langSafe, 'confirmed'), langSafe, undefined, 'bookingAlert')
    if (ok) { localStorage.setItem('agronexus-voice-enabled', '1'); setVoiceEnabled(true) }
  }
  const announceEvent = (event, token = activeBookingToken) => {
    const storageKey = `agronexus-last-voice-event:${token}`
    if (localStorage.getItem(storageKey) === event) return
    const message = voiceMessage(langSafe, event)
    if (!message) return
    localStorage.setItem(storageKey, event)
    setNotifications(list => [{ id: Date.now() + Math.random(), message, time: t('alertJustNow'), channel: t('alertChannel'), voiceKey: voiceKeyForEvent(event) }, ...list].slice(0, 6))
    if (voiceEnabled || event === 'confirmed') speakAlert(message, langSafe, undefined, voiceKeyForEvent(event))
  }
  useEffect(() => {
    // These are farmer-facing alerts. Operator actions should be announced
    // only on the farmer dashboard, after the shared booking status changes.
    if (path !== '/dashboard') return
    const previous = previousActiveStatusRef.current
    if (previous && previous !== activeBookingStatus) {
      const event = voiceEventsByStatus[activeBookingStatus]
      if (event) announceEvent(event)
    }
    previousActiveStatusRef.current = activeBookingStatus
  }, [path, activeBookingToken, activeBookingStatus, langSafe, voiceEnabled])
  const setLang = value => { setLangState(value); localStorage.setItem('agronexus-language', value) }
  const [online, setOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [syncMode] = useState(() => cloudSyncEnabled() ? 'cloud' : 'local')
  const [pendingSync, setPendingSync] = useState(false)
  const [syncLabel, setSyncLabel] = useState('idle')
  const [syncHydrated, setSyncHydrated] = useState(false)
  const [cloudLocalTimestamp, setCloudLocalTimestamp] = useState(() => localStorage.getItem('agronexus-cloud-local-timestamp') || '')
  const cloudApplyingRef = useRef(false)
  const lastSavedSnapshotRef = useRef('')
  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])
  const syncSnapshot = () => ({ booking, queue: { ...queue, bookingToken: activeBookingToken }, bookings, savedAt: new Date().toISOString() })
  const publishSharedState = async (nextBooking, nextQueue, nextBookings) => {
    if (syncMode !== 'cloud' || !navigator.onLine) { setPendingSync(syncMode === 'cloud'); return }
    try {
      setSyncLabel('syncing')
      const payload = { booking: nextBooking, queue: { ...nextQueue, bookingToken: nextBooking?.token || activeBookingToken }, bookings: nextBookings, savedAt: new Date().toISOString() }
      await saveCloudState(payload)
      const stamp = payload.savedAt
      setCloudLocalTimestamp(stamp)
      localStorage.setItem('agronexus-cloud-local-timestamp', stamp)
      lastSavedSnapshotRef.current = JSON.stringify({ booking: payload.booking, queue: payload.queue, bookings: payload.bookings })
      setPendingSync(false)
      setSyncLabel('synced')
    } catch (error) {
      console.warn('AgroNexus shared-state write:', error)
      setPendingSync(true)
      setSyncLabel('failed')
    }
  }
  const applySnapshot = snapshot => {
    if (!snapshot) return
    cloudApplyingRef.current = true
    const cloudBookings = Array.isArray(snapshot.bookings) ? snapshot.bookings : []
    // The cloud booking list is the shared source of truth. Apply it locally
    // so the Farmer dashboard (and voice-alert effect) sees Operator status
    // changes immediately without a browser refresh.
    if (cloudBookings.length) setBookings(cloudBookings)
    // activeBookingToken is a per-device farmer selection. Never overwrite it
    // with the operator's device selection from the cloud snapshot.
    const localToken = activeBookingTokenRef.current || booking?.token || 'AN-1841'
    // Resolve the Farmer's demo identity against the shared cloud bookings.
    // If an old/stale local token is not present in the cloud snapshot, bind the
    // Farmer to the demo farmer (Ramesh Kumar) instead of inventing a new token.
    const matching =
      cloudBookings.find(item => item.token === localToken) ||
      cloudBookings.find(item => String(item.farmer || '').trim().toLowerCase() === 'ramesh kumar') ||
      cloudBookings.find(item => item.status !== 'Completed') ||
      cloudBookings[0] ||
      null
    const nextActiveToken = matching?.token || localToken

    setActiveBookingToken(nextActiveToken)
    if (matching) {
      const centre = centres.find(c => c.id === matching.centreId) || booking?.centre || centres[0]
      const slot = slots.find(s => s.time === matching.slot) || booking?.slot || slots[0]
      const quantityText = String(matching.quantity || '')
      const quantityMatch = quantityText.match(/\d+(?:\.\d+)?/)
      const unitMatch = quantityText.match(/\b(quintals|kilograms|bags)\b/i)
      setBooking(prev => ({
        ...prev,
        token: matching.token,
        crop: matching.crop || prev.crop,
        quantity: quantityMatch?.[0] || prev.quantity,
        unit: unitMatch?.[1]?.toLowerCase() || prev.unit,
        centre,
        slot,
      }))

      const status = matching.status || 'Booked'
      const sharedQueue = snapshot.queue?.bookingToken === nextActiveToken ? snapshot.queue : null
      setQueue(q => ({
        ...q,
        ...(sharedQueue || {}),
        bookingToken: nextActiveToken,
        status,
        position: status === 'Completed' ? 0 : status === 'Your Turn' ? 1 : sharedQueue?.position ?? q.position,
        wait: status === 'Completed' || status === 'Your Turn' ? 0 : sharedQueue?.wait ?? q.wait,
        served: status === 'Your Turn' || status === 'In progress' ? matching.token : sharedQueue?.served ?? q.served,
        updated: snapshot.cloudUpdatedAt || snapshot.savedAt || q.updated,
      }))
      return
    }

    if (snapshot.queue?.bookingToken === nextActiveToken) {
      setQueue({ ...snapshot.queue, bookingToken: nextActiveToken })
    }
  }
  const syncNow = async () => {
    if (syncMode !== 'cloud') { setSyncLabel('not-configured'); return }
    if (!navigator.onLine) { setSyncLabel('offline'); setPendingSync(true); return }
    try {
      setSyncLabel('syncing')
      const snapshot = syncSnapshot()
      await saveCloudState(snapshot)
      const stamp = snapshot.savedAt
      setCloudLocalTimestamp(stamp)
      localStorage.setItem('agronexus-cloud-local-timestamp', stamp)
      setPendingSync(false)
      setSyncLabel('synced')
    } catch (error) {
      console.warn('AgroNexus cloud sync:', error)
      setPendingSync(true)
      setSyncLabel('failed')
    }
  }
  useEffect(() => {
    let cancelled = false
    const hydrate = async () => {
      if (syncMode !== 'cloud' || !navigator.onLine) { setSyncHydrated(true); return }
      try {
        const cloud = await loadCloudState()
        if (!cancelled && cloud) {
          applySnapshot(cloud)
          const stamp = cloud.cloudUpdatedAt || cloud.savedAt || ''
          setCloudLocalTimestamp(stamp)
          localStorage.setItem('agronexus-cloud-local-timestamp', stamp)
          lastSavedSnapshotRef.current = JSON.stringify({ booking: cloud.booking, queue: cloud.queue, bookings: cloud.bookings })
        }
        if (!cancelled && !cloud) await saveCloudState(syncSnapshot())
        if (!cancelled) setSyncLabel(cloud ? 'synced' : 'synced')
      } catch (error) {
        console.warn('AgroNexus cloud hydrate:', error)
        if (!cancelled) setSyncLabel('failed')
      } finally { if (!cancelled) setSyncHydrated(true) }
    }
    hydrate()
    return () => { cancelled = true }
  }, [])
  // Shared booking/status writes are performed explicitly by the action handlers.
  // This avoids a stale React snapshot overwriting a newer cloud update.
  useEffect(() => {
    if (syncMode !== 'cloud' || !online) return
    let cancelled = false
    const refresh = async () => {
      try {
        const cloud = await loadCloudState()
        if (cancelled || !cloud) return
        const localTime = Date.parse(localStorage.getItem('agronexus-cloud-local-timestamp') || 0) || 0
        const cloudTime = Date.parse(cloud.cloudUpdatedAt || cloud.savedAt || 0) || 0
        // A cloud snapshot with an equal timestamp can still contain a changed
        // payload on some PostgREST/cache paths. Compare the actual shared data too.
        const cloudKey = JSON.stringify({ booking: cloud.booking, queue: cloud.queue, bookings: cloud.bookings })
        const currentKey = JSON.stringify({ booking, queue, bookings })
        if (cloudTime > localTime || cloudKey !== currentKey) {
          applySnapshot(cloud)
          const stamp = cloud.cloudUpdatedAt || cloud.savedAt || ''
          setCloudLocalTimestamp(stamp)
          localStorage.setItem('agronexus-cloud-local-timestamp', stamp)
          lastSavedSnapshotRef.current = cloudKey
          setSyncLabel('synced')
          setPendingSync(false)
        }
      } catch (error) { console.warn('AgroNexus cloud poll:', error) }
    }
    refresh()
    const timer = window.setInterval(refresh, 1000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [syncMode, online, booking, queue, bookings])
  useEffect(() => {
    if (syncMode !== 'cloud' || !online) return
    return subscribeToCloudState(cloud => {
      const cloudTime = Date.parse(cloud.cloudUpdatedAt || cloud.savedAt || 0) || 0
      const localTime = Date.parse(localStorage.getItem('agronexus-cloud-local-timestamp') || 0) || 0
      if (cloudTime < localTime) return
      applySnapshot(cloud)
      const stamp = cloud.cloudUpdatedAt || cloud.savedAt || ''
      setCloudLocalTimestamp(stamp)
      localStorage.setItem('agronexus-cloud-local-timestamp', stamp)
      setPendingSync(false)
      setSyncLabel('synced')
    }, status => {
      if (status === 'failed') setSyncLabel('failed')
    })
  }, [syncMode, online])
  const go = next => { window.history.pushState({}, '', next); setPath(next); window.scrollTo(0, 0) }
  const reset = () => { const nextBooking = { crop: 'Wheat', quantity: '25', unit: 'quintals', centre: centres[0], slot: slots[0], token: 'AN-1841' }; const nextQueue = { position: 7, wait: 35, served: 'AN-1834', updated: 'Just now', status: 'Booked', bookingToken: 'AN-1841' }; setActiveBookingToken('AN-1841'); setBooking(nextBooking); setQueue(nextQueue); setBookings(initialBookings); setNotifications([]); localStorage.removeItem('agronexus-booking'); localStorage.removeItem('agronexus-queue'); localStorage.removeItem('agronexus-bookings'); localStorage.removeItem('agronexus-cloud-local-timestamp'); localStorage.removeItem('agronexus-active-booking-token'); localStorage.removeItem('agronexus-last-voice-event:AN-1841'); setCloudLocalTimestamp(''); go('/dashboard') }
  const pageProps = { go, reset, booking, setBooking, activeBookingToken, setActiveBookingToken, queue, setQueue, bookings, setBookings, notifications, setNotifications, addNotification, announceEvent, enableVoice, voiceEnabled, t, lang, setLang, syncMode, online, pendingSync, syncNow, syncLabel, publishSharedState }
  if (path === '/login') return <Login go={go} t={t} lang={lang} setLang={setLang} />
  if (path === '/dashboard') return <Layout {...pageProps}><Dashboard {...pageProps} /></Layout>
  if (path === '/select-crop') return <Layout {...pageProps}><Crop {...pageProps} /></Layout>
  if (path === '/select-centre') return <Layout {...pageProps}><Centre {...pageProps} /></Layout>
  if (path === '/select-slot') return <Layout {...pageProps}><Slot {...pageProps} /></Layout>
  if (path === '/confirmation') return <Layout {...pageProps}><Confirm {...pageProps} /></Layout>
  if (path === '/token') return <Layout {...pageProps}><Token {...pageProps} /></Layout>
  if (path === '/queue') return <Layout {...pageProps}><Queue {...pageProps} /></Layout>
  if (path === '/tracking') return <Layout {...pageProps}><Tracking {...pageProps} /></Layout>
  if (path === '/operator') return <Layout {...pageProps} operator><Operator {...pageProps} /></Layout>
  return <Login go={go} t={t} lang={lang} setLang={setLang} />
}

function Login({ go, t, lang, setLang }) { const [mobile, setMobile] = useState('9876543210'); const [error, setError] = useState(''); const submit = e => { e.preventDefault(); if (!/^\d{10}$/.test(mobile)) return setError(t('invalidMobile')); go('/dashboard') }; return <main className="min-h-screen bg-mist p-4"><div className="mx-auto flex max-w-5xl justify-end"><LanguageSwitcher lang={lang} setLang={setLang} t={t}/></div><div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-5xl items-center gap-10 lg:grid-cols-2"><section><Logo t={t}/><p className="mt-10 text-sm font-bold uppercase tracking-widest text-leaf">{t('sihPrototype')}</p><h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900">{t('hero')}</h1><p className="mt-5 max-w-lg text-lg text-slate-600">{t('heroText')}</p><div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{t('demoMode')}</div></section><section className="card mx-auto w-full max-w-md p-7"><h2 className="text-2xl font-bold">{t('farmerLogin')}</h2><p className="mt-1 text-sm text-slate-500">{t('mobileHint')}</p><form className="mt-6 space-y-4" onSubmit={submit}><div><label className="label" htmlFor="mobile">{t('mobile')}</label><input id="mobile" className="input" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} inputMode="numeric" /></div>{error && <p className="text-sm text-rose-700">{error}</p>}<button className="btn-primary w-full" type="submit">{t('login')}</button></form><div className="my-5 border-t border-slate-200" /><button className="btn-secondary w-full" onClick={() => go('/operator')}>{t('operatorDemo')}</button></section></div></main> }
function AlertList({ notifications, t, lang, addNotification }) {
  const [voiceStatus, setVoiceStatus] = useState('idle')
  const speak = (text, voiceKey = 'bookingAlert') => speakAlert(text, lang, setVoiceStatus, voiceKey)
  const handleTest = () => {
    addNotification('bookingAlert')
    speak(t('bookingAlert'), 'bookingAlert')
  }
  const support = getSpeechSupport()
  const statusText = voiceStatus === 'unsupported' ? t('voiceUnavailable')
    : voiceStatus === 'ready' || voiceStatus === 'idle' ? t('voiceReady')
    : voiceStatus === 'speaking' || voiceStatus.startsWith('speaking:') ? t('voiceSpeaking')
    : voiceStatus.startsWith('error:') ? t('voiceError')
    : t('voiceReady')
  return <aside className="card">
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-bold">{t('alertTitle')}</h2>
      <button className="btn-secondary text-xs" onClick={handleTest}>{t('testAlert')}</button>
    </div>
    <p className="mt-1 text-xs text-slate-500">{t('alertChannel')}</p>
    <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
      {support.voices.length === 0 ? t('voiceNoVoice') : statusText}
    </div>
    <div className="mt-4 space-y-3">
      {notifications.length === 0 ? <p className="text-sm text-slate-500">{t('noAlerts')}</p> : notifications.map(n => <div key={n.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-800">{n.message}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{n.time} · {n.channel}</span>
          <button className="font-bold text-forest underline" onClick={() => speak(n.message, n.voiceKey)}>{t('listen')} 🔊</button>
        </div>
      </div>)}
    </div>
    <button className="btn-secondary mt-3 w-full" onClick={() => speak(t('bookingAlert'), 'bookingAlert')}>{t('testVoice')} 🔊</button>
  </aside>
}

function Dashboard({ go, booking, queue, notifications, addNotification, t, lang, enableVoice, voiceEnabled }) {
  const statusLabel = queue.status === 'Booked' ? t('bookedStatus') : queue.status === 'Checked in' ? t('checkedInStatus') : queue.status === 'Waiting in Queue' ? t('waitingStatus') : queue.status === 'Your Turn' ? t('yourTurnStatus') : queue.status === 'In progress' ? t('processingStatus') : t('completedStatus')
  return <>
    <PageTitle eyebrow={t('farmerDashboard')} title={t('namaste')} text={t('upcomingReady')} />
    {!voiceEnabled && <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div><p className="font-bold text-amber-900">Enable farmer voice alerts</p><p className="mt-1 text-sm text-amber-800">Tap once on this device so the browser allows automatic turn/status announcements later.</p></div><button className="btn-primary" onClick={enableVoice}>Enable voice 🔊</button></section>}
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label={t('tokenNumber')} value={booking.token} note={t('demoToken')} />
      <Metric label={t('queuePosition')} value={`#${queue.position}`} note={`${Math.max(0, queue.position - 1)} ${t('farmersAhead')}`} />
      <Metric label={t('estimatedWait')} value={`${queue.wait} min`} note={t('simulatedEstimate')} />
      <Metric label={t('procurementStatus')} value={statusLabel} note={t('statusUpdated')} />
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="card lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{t('upcomingSlot')}</h2><p className="text-sm text-slate-500">{t('fictionalBooking')}</p></div><Badge t={t}>{queue.status}</Badge></div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <Info label={t('cropQuantity')} value={`${t(cropKey[booking.crop])} · ${booking.quantity} ${t(booking.unit) || booking.unit}`} />
          <Info label={t('procurementCentre')} value={booking.centre.name} />
          <Info label={t('dateTime')} value={`${booking.slot.date} · ${booking.slot.time}`} />
          <Info label={t('queue')} value={`${t('position')} #${queue.position} · ${t('approxSymbol')} ${queue.wait} min`} />
        </dl>
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm"><span className="font-bold text-forest">{t('queueProgress')}</span><span className="font-semibold text-slate-600">{Math.max(0, queue.position - 1)} {t('peopleAhead')}</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-forest" style={{ width: `${Math.min(100, Math.max(8, 100 - (queue.position - 1) * 9))}%` }} /></div>
          <p className="mt-3 text-sm text-slate-600">{queue.status === 'Your Turn' ? t('reachCentre') : `${t('nextAction')}: ${queue.status === 'Completed' ? t('completedStatus') : queue.status === 'In progress' ? t('processingStatus') : t('reachCentre')}`}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><button className="btn-primary" onClick={() => go('/select-crop')}>{t('bookNewSlot')}</button><button className="btn-secondary" onClick={() => go('/token')}>{t('viewToken')}</button><button className="btn-secondary" onClick={() => go('/tracking')}>{t('trackProcurement')}</button><button className="btn-secondary" onClick={() => go('/queue')}>{t('openLiveQueue')}</button></div>
      </section>
      <AlertList notifications={notifications} t={t} lang={lang} addNotification={addNotification} />
    </div>
  </>
}

function Crop({ go, booking, setBooking, t }) { const [draft, setDraft] = useState(booking); const [error, setError] = useState(''); const submit = e => { e.preventDefault(); if (!draft.crop || !draft.quantity || Number(draft.quantity) <= 0) return setError(t('cropError')); setBooking(draft); go('/select-centre') }; return <><PageTitle eyebrow={t('newBooking1')} title={t('whatBringing')} text={t('selectCropText')} /><form onSubmit={submit} className="card max-w-2xl space-y-5"><div><label className="label">{t('crop')}</label><select className="input" value={draft.crop} onChange={e => setDraft({ ...draft, crop: e.target.value })}>{[['Wheat','wheat'],['Paddy','paddy'],['Maize','maize'],['Mustard','mustard'],['Chickpea','chickpea']].map(([v,k]) => <option key={v} value={v}>{t(k)}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="label">{t('quantity')}</label><input className="input" type="number" min="1" value={draft.quantity} onChange={e => setDraft({ ...draft, quantity: e.target.value })} /></div><div><label className="label">{t('unit')}</label><select className="input" value={draft.unit} onChange={e => setDraft({ ...draft, unit: e.target.value })}><option value="quintals">{t('quintals')}</option><option value="kilograms">{t('kilograms')}</option><option value="bags">{t('bags')}</option></select></div></div>{error && <p className="text-sm text-rose-700">{error}</p>}<div className="flex gap-3"><button className="btn-primary">{t('continueCentre')}</button><button type="button" className="btn-secondary" onClick={() => go('/dashboard')}>{t('cancel')}</button></div></form></> }
function Centre({ go, booking, setBooking, t }) {
  const defaultCentre = booking.centre?.id || centres.find(c => c.recommended && c.status !== 'Full')?.id || centres.find(c => c.status !== 'Full')?.id || centres[0].id;
  const [selected, setSelected] = useState(defaultCentre);
  const selectedCentre = centres.find(c => c.id === selected);
  return <>
    <PageTitle eyebrow={t('newBooking2')} title={t('chooseCentre')} text={t('centreText')} />
    <section className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-bold text-forest">{t('discoveryHint')}</p><p className="mt-1 text-sm text-slate-600">{t('routeHint')}</p></div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-forest shadow-sm">{t('nearby')}</span>
      </div>
    </section>
    <div className="grid gap-4 lg:grid-cols-3">
      {centres.map(c => {
        const isSelected = selected === c.id;
        const disabled = c.status === 'Full';
        return <button key={c.id} disabled={disabled} onClick={() => setSelected(c.id)} className={`card relative text-left transition ${isSelected ? 'border-forest ring-2 ring-emerald-100' : 'hover:border-emerald-400'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
          {c.recommended && !disabled && <span className="absolute -top-3 left-4 rounded-full bg-forest px-3 py-1 text-xs font-bold text-white">★ {t('recommended')}</span>}
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold leading-snug">{c.name}</h2><p className="mt-1 text-sm text-slate-500">{c.location} · {c.distance}</p></div>
            <Badge t={t}>{c.status}</Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('todayAvailability')}</p><p className="mt-1 text-lg font-bold">{c.availability} <span className="text-xs font-medium text-slate-500">{t('slots')}</span></p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('currentQueue')}</p><p className="mt-1 text-lg font-bold">{c.queue} <span className="text-xs font-medium text-slate-500">{t('farmers')}</span></p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('estimatedWait')}</p><p className="mt-1 text-lg font-bold">{c.wait} <span className="text-xs font-medium text-slate-500">{t('minutes')}</span></p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('distanceLabel')}</p><p className="mt-1 text-lg font-bold">{c.distance}</p></div>
          </div>
          {disabled && <p className="mt-4 text-sm font-semibold text-rose-600">{t('unavailableReason')}</p>}
          {!disabled && <p className="mt-4 text-xs font-medium text-emerald-700">● {c.availability} {t('availableNow')}</p>}
        </button>
      })}
    </div>
    {selectedCentre && <section className="card mt-6 border-forest/20 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-forest">{t('selectedCentre')}</p><h2 className="mt-1 text-xl font-bold">{selectedCentre.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedCentre.distance} · {selectedCentre.queue} {t('farmers')} · {selectedCentre.wait} {t('minutes')}</p></div>
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-forest">{selectedCentre.availability} {t('slots')} {t('availableNow')}</div>
      </div>
    </section>}
    <div className="mt-6 flex gap-3"><button className="btn-primary" disabled={!selectedCentre || selectedCentre.status === 'Full'} onClick={() => { if (selectedCentre) { setBooking({ ...booking, centre: selectedCentre }); go('/select-slot') } }}>{t('continueSlots')}</button><button className="btn-secondary" onClick={() => go('/select-crop')}>{t('back')}</button></div>
  </>
}
function Slot({ go, booking, setBooking, t }) {
  const [selected, setSelected] = useState(booking.slot?.id || '')
  const selectedSlot = slots.find(s => s.id === selected)
  const dates = [...new Set(slots.map(s => s.date))]
  const [date, setDate] = useState(booking.slot?.date || dates[0])
  const dateSlots = slots.filter(s => s.date === date)
  const chooseDate = nextDate => {
    setDate(nextDate)
    const first = slots.find(s => s.date === nextDate && s.available)
    setSelected(first?.id || '')
  }
  const chooseSlot = slot => {
    if (!slot.available) return
    setSelected(slot.id)
  }
  const continueToReview = () => {
    if (!selectedSlot?.available) return
    setBooking({ ...booking, slot: selectedSlot })
    go('/confirmation')
  }
  return <>
    <PageTitle eyebrow={t('newBooking3')} title={t('selectSlot')} text={`${t('slots')} ${booking.centre.name}. ${t('scheduleSim')}`} />

    <section className="card mb-6 border-emerald-100 bg-emerald-50/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-forest">{t('bookingFor')}</p>
          <p className="mt-1 font-semibold text-slate-800">{booking.centre.name}</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-forest shadow-sm">
          {booking.quantity} {t(booking.unit) || booking.unit} · {t(cropKey[booking.crop])}
        </div>
      </div>
    </section>

    <div className="mb-5">
      <p className="label">{t('selectDate')}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {dates.map(d => {
          const count = slots.filter(s => s.date === d && s.available).length
          return <button key={d} type="button" onClick={() => chooseDate(d)} className={`rounded-2xl border p-4 text-left transition ${date === d ? 'border-forest bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-emerald-400'}`}>
            <p className="font-bold">{d}</p>
            <p className="mt-1 text-sm text-slate-500">{count} {t('slots')} {t('available')}</p>
          </button>
        })}
      </div>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="label mb-0">{t('selectTime')}</p>
        <span className="text-xs font-semibold text-slate-500">{t('tapSlot')}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {dateSlots.map(s => {
          const almostFull = s.available && s.remaining <= 3
          const disabled = !s.available
          return <button key={s.id} type="button" disabled={disabled} onClick={() => chooseSlot(s)} className={`card flex items-center justify-between gap-4 text-left transition ${selected === s.id ? 'border-forest bg-emerald-50 ring-2 ring-emerald-100' : ''} ${disabled ? 'cursor-not-allowed opacity-55' : 'hover:border-emerald-400'}`}>
            <div>
              <p className="text-lg font-bold">{s.time}</p>
              <p className="mt-1 text-sm text-slate-500">{disabled ? t('slotFull') : almostFull ? t('almostFull') : t('available')}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${disabled ? 'bg-rose-100 text-rose-800' : almostFull ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {disabled ? t('full') : `${s.remaining} ${t('placesLeft')}`}
              </span>
              {selected === s.id && <p className="mt-2 text-xs font-bold text-forest">✓ {t('selected')}</p>}
            </div>
          </button>
        })}
      </div>
    </div>

    {selectedSlot?.available && <section className="card mt-6 border-forest/20">
      <p className="text-xs font-bold uppercase tracking-wider text-forest">{t('bookingSummary')}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <Info label={t('centre')} value={booking.centre.name} />
        <Info label={t('date')} value={selectedSlot.date} />
        <Info label={t('time')} value={selectedSlot.time} />
      </div>
    </section>}

    <div className="mt-6 flex flex-wrap gap-3">
      <button className="btn-primary" disabled={!selectedSlot?.available} onClick={continueToReview}>{t('reviewBooking')}</button>
      <button className="btn-secondary" onClick={() => go('/select-centre')}>{t('back')}</button>
    </div>
  </>
}
function Confirm({ go, booking, queue, setBooking, setBookings, setActiveBookingToken, setQueue, announceEvent, t, syncMode, online }) {
  const confirm = () => {
    const nextToken = Math.max(1840, ...JSON.parse(localStorage.getItem('agronexus-bookings') || '[]').map(b => Number(String(b.token || '').replace('AN-', '')) || 0)) + 1
    const token = `AN-${nextToken}`
    const newBooking = { ...booking, token }
    setActiveBookingToken(token)
    setBooking(newBooking)
    const created = { id: Date.now(), token, farmer: 'Ramesh Kumar', crop: booking.crop, quantity: `${booking.quantity} ${booking.unit}`, slot: booking.slot.time, status: 'Booked', centreId: booking.centre.id }
    const nextQueue = { ...queue, bookingToken: token, position: Math.max(1, queue.position), wait: Math.max(10, queue.wait), status: 'Booked', updated: t('updatedJustNow') }
    const currentBookings = (() => { try { const saved = JSON.parse(localStorage.getItem('agronexus-bookings') || '[]'); return Array.isArray(saved) && saved.length ? saved : initialBookings } catch { return initialBookings } })()
    const nextBookings = [created, ...currentBookings.filter(b => b.token !== token)]
    setBookings(nextBookings)
    setQueue(nextQueue)
    // A new farmer booking is a shared write: persist it immediately instead of
    // waiting for the operator-only auto-save effect. This makes the new token
    // appear on the operator screen on another device.
    if (syncMode === 'cloud' && online) {
      saveCloudState({ booking: newBooking, queue: nextQueue, bookings: nextBookings, savedAt: new Date().toISOString() })
        .catch(error => console.warn('AgroNexus booking cloud sync:', error))
    }
    localStorage.removeItem(`agronexus-last-voice-event:${token}`)
    announceEvent('confirmed', token)
    go('/token')
  }
  return <><PageTitle eyebrow={t('review')} title={t('confirmArrival')} text={t('tokenLocal')} /><section className="card max-w-2xl"><div className="grid gap-5 sm:grid-cols-2"><Info label={t('farmer')} value="Ramesh Kumar" /><Info label={t('cropQuantity')} value={`${t(cropKey[booking.crop])} · ${booking.quantity} ${t(booking.unit) || booking.unit}`} /><Info label={t('centre')} value={booking.centre.name} /><Info label={t('slot')} value={`${booking.slot.date} · ${booking.slot.time}`} /></div><div className="mt-7 flex flex-wrap gap-3"><button className="btn-primary" onClick={confirm}>{t('confirmBooking')}</button><button className="btn-secondary" onClick={() => go('/select-slot')}>{t('backEdit')}</button></div></section></>
}

function Token({ go, booking, queue, t }) { return <><PageTitle eyebrow={t('digitalToken')} title={t('tokenReady')} text={t('tokenHelp')} /><section className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-forest text-white shadow-xl"><div className="flex items-center justify-between border-b border-white/20 p-6"><Logo inverse t={t}/><Badge t={t}>{queue.status}</Badge></div><div className="grid gap-7 p-7 sm:grid-cols-[1fr_auto]"><div><p className="text-sm text-emerald-100">{t('tokenLabel')}</p><p className="mt-1 text-4xl font-bold">{booking.token}</p><div className="mt-7 space-y-3 text-sm text-emerald-50"><p><b>{t('farmer')}:</b> Ramesh Kumar</p><p><b>{t('crop')}:</b> {t(cropKey[booking.crop])} · {booking.quantity} {t(booking.unit) || booking.unit}</p><p><b>{t('centre')}:</b> {booking.centre.name}</p><p><b>{t('slot')}:</b> {booking.slot.date}, {booking.slot.time}</p><p><b>{t('queueStatus')}:</b> {queue.status}</p><p><b>{t('peopleAhead')}:</b> {Math.max(0, queue.position - 1)} · <b>{t('estimatedWait')}:</b> {queue.wait} min</p></div></div><div className="grid h-36 w-36 grid-cols-7 gap-1 bg-white p-2" aria-label="Decorative QR code placeholder">{Array.from({ length: 49 }, (_, i) => <i key={i} className={(i * 7 + i * i) % 5 < 2 ? 'bg-slate-900' : 'bg-white'} />)}</div></div><p className="bg-black/10 px-7 py-3 text-xs text-emerald-100">{t('qrPlaceholder')}</p></section><div className="mt-6 flex justify-center gap-3"><button className="btn-primary" onClick={() => go('/dashboard')}>{t('backDashboard')}</button><button className="btn-secondary" onClick={() => go('/queue')}>{t('liveQueue')}</button></div></> }

function Queue({ go, booking, activeBookingToken, queue, setQueue, setBookings, t }) {
  const updateActiveBooking = (status, changes = {}) => {
    setBookings(list => list.map(item => item.token === activeBookingToken ? { ...item, status } : item))
    setQueue(current => ({ ...current, ...changes, bookingToken: activeBookingToken, status, updated: t('updatedJustNow') }))
  }
  const refresh = () => {
    const nextPosition = Math.max(1, queue.position - 1)
    const next = { ...queue, position: nextPosition, wait: Math.max(5, queue.wait - 5), served: `AN-${Number(queue.served.slice(3)) + 1}`, updated: t('updatedJustNow'), status: nextPosition <= 1 ? 'Your Turn' : nextPosition <= 3 ? 'Waiting in Queue' : 'Waiting in Queue' }
    updateActiveBooking(next.status, next)
  }
  const checkedIn = () => updateActiveBooking('Checked in')
  const label = queue.status === 'Booked' ? t('bookedStatus') : queue.status === 'Checked in' ? t('checkedInStatus') : queue.status === 'Waiting in Queue' ? t('waitingStatus') : queue.status === 'Your Turn' ? t('yourTurnStatus') : queue.status === 'In progress' ? t('processingStatus') : t('completedStatus')
  return <><PageTitle eyebrow={t('queueEyebrow')} title={t('simulatedQueue')} text={t('queueText')} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Metric label={t('tokenNumber')} value={booking.token} /><Metric label={t('position')} value={`#${queue.position}`} /><Metric label={t('peopleAhead')} value={Math.max(0, queue.position - 1)} /><Metric label={t('estimatedWait')} value={`${queue.wait} min`} /><Metric label={t('servingNow')} value={queue.served} /></div><section className="card mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-bold">{t('queueStatus')}</h2><Badge t={t}>{queue.status}</Badge></div><p className="mt-1 text-sm text-slate-500">{Math.max(0, queue.position - 1)} {t('farmersAhead')} · {t('lastUpdated')}: {queue.updated}</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={checkedIn}>{t('markCheckedIn')}</button><button className="btn-primary" onClick={refresh}>{t('advanceQueue')}</button></div></div><div className="mt-6 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm"><span className="font-semibold">{t('queueProgress')}</span><span className="font-bold">#{queue.position}</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-forest" style={{ width: `${Math.min(100, Math.max(8, 100 - (queue.position - 1) * 9))}%` }} /></div><p className="mt-3 text-sm text-slate-600">{queue.position <= 1 ? t('reachCentre') : `${label} · ${queue.wait} min ${t('approxSymbol')}`}</p></div></section><div className="mt-6 flex flex-wrap gap-3"><button className="btn-secondary" onClick={() => go('/token')}>{t('digitalToken')}</button><button className="btn-secondary" onClick={() => go('/tracking')}>{t('trackStatus')}</button><button className="btn-secondary" onClick={() => go('/dashboard')}>{t('backDashboard')}</button></div></>
}

function Tracking({ go, booking, queue, t }) { const stageIndex = { Booked: 0, 'Checked in': 1, 'Waiting in Queue': 2, 'Your Turn': 2, 'In progress': 3, Completed: 4 }; const current = stageIndex[queue.status] ?? 0; const stages = [['slotBooked','Slot Booked'],['farmerCheckedIn','Farmer Checked In'],['waitingQueue','Waiting in Queue'],['procurementProgress','Procurement In Progress'],['procurementCompleted','Procurement Completed']]; return <><PageTitle eyebrow={t('tracking')} title={t('journey')} text={t('trackingText')} /><div className="grid gap-6 lg:grid-cols-3"><section className="card lg:col-span-2"><ol className="space-y-5">{stages.map(([key, raw], i) => <li key={raw} className="flex gap-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold ${i <= current ? 'bg-forest text-white' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span><div className="pt-1"><p className={`font-bold ${i <= current ? 'text-forest' : ''}`}>{t(key)}</p><p className="text-sm text-slate-500">{i <= current ? t('statusUpdated') : t('pendingNext')}</p></div></li>)}</ol></section><aside className="card"><h2 className="font-bold">{t('bookingDetails')}</h2><dl className="mt-4 space-y-4"><Info label={t('tokenNumber')} value={booking.token} /><Info label={t('centre')} value={booking.centre.name} /><Info label={t('quantity')} value={`${booking.quantity} ${t(booking.unit) || booking.unit}`} /><Info label={t('currentStatus')} value={queue.status} /><Info label={t('position')} value={`#${queue.position}`} /><Info label={t('estimatedWait')} value={`${queue.wait} min`} /></dl><button className="btn-secondary mt-6 w-full" onClick={() => go('/dashboard')}>{t('backDashboard')}</button></aside></div></> }

function Operator({ go, bookings, setBookings, setQueue, booking, activeBookingToken, queue, t, publishSharedState }) {
  const initialOperatorCentre = booking.centre?.id || 'c1'
  const [operatorCentre, setOperatorCentre] = useState(initialOperatorCentre)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [paused, setPaused] = useState(false)
  const [notice, setNotice] = useState('')

  const selectedCentre = centres.find(c => c.id === operatorCentre) || centres[0]
  const centreBookings = bookings.filter(b => (b.centreId || 'c1') === selectedCentre.id)
  const activeBookings = centreBookings.filter(b => b.status !== 'Completed')
  const pendingQueueBookings = centreBookings.filter(b => b.status === 'Checked in' || b.status === 'Booked')
  const checkedIn = centreBookings.filter(b => b.status === 'Checked in').length
  const processing = centreBookings.filter(b => b.status === 'In progress' || b.status === 'Your Turn').length
  const completed = centreBookings.filter(b => b.status === 'Completed').length
  const capacity = 60
  const used = centreBookings.length
  const utilization = Math.round((used / capacity) * 100)
  const queueForCentre = operatorCentre === booking.centre?.id ? queue : { position: Math.max(1, selectedCentre.queue), wait: selectedCentre.wait, served: centreBookings.find(b => b.status === 'In progress' || b.status === 'Your Turn')?.token || '—' }
  const queueHealthy = queueForCentre.position <= 8 && queueForCentre.wait <= 45

  const visible = centreBookings.filter(b => {
    const matchesFilter = filter === 'active' ? b.status !== 'Completed' : true
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || b.farmer.toLowerCase().includes(q) || b.token.toLowerCase().includes(q)
    return matchesFilter && matchesQuery
  })

  const update = (id, status) => {
    const target = bookings.find(b => b.id === id)
    if (!target) return
    const nextBookings = bookings.map(b => b.id === id ? { ...b, status } : b)
    let nextQueue = queue
    if (target.token === activeBookingToken && target.centreId === booking.centre?.id) {
      const mapped = status === 'Booked' ? 'Booked' : status === 'Checked in' ? 'Checked in' : status === 'Your Turn' ? 'Your Turn' : status === 'In progress' ? 'In progress' : 'Completed'
      nextQueue = { ...queue, bookingToken: activeBookingToken, status: mapped, position: mapped === 'Completed' ? 0 : mapped === 'Your Turn' ? 1 : queue.position, wait: mapped === 'Completed' || mapped === 'Your Turn' ? 0 : queue.wait, served: mapped === 'Your Turn' || mapped === 'In progress' ? target.token : queue.served, updated: t('updatedJustNow') }
      setQueue(nextQueue)
    }
    setBookings(nextBookings)
    setNotice(`${target.token} — ${status}`)
    publishSharedState(booking, nextQueue, nextBookings)
  }

  const callNext = () => {
    if (paused) return
    const next = centreBookings.find(b => b.status === 'Checked in') || centreBookings.find(b => b.status === 'Booked')
    if (!next) { setNotice(t('noNext')); return }
    // Calling a token means the farmer's turn has arrived; processing starts only after the operator presses Start processing.
    const nextBookings = bookings.map(b => b.id === next.id ? { ...b, status: 'Your Turn' } : b)
    let nextQueue = queue
    if (next.token === activeBookingToken && next.centreId === booking.centre?.id) {
      nextQueue = { ...queue, bookingToken: activeBookingToken, served: next.token, status: 'Your Turn', position: 1, wait: 0, updated: t('updatedJustNow') }
      setQueue(nextQueue)
    }
    setBookings(nextBookings)
    publishSharedState(booking, nextQueue, nextBookings)
    setNotice(`${next.token} — ${t('callSuccess')}`)
  }

  const resetLocal = () => {
    const nextQueue = { position: 7, wait: 35, served: 'AN-1834', updated: t('updatedJustNow'), status: 'Booked', bookingToken: booking.token }
    setBookings(initialBookings)
    setQueue(nextQueue)
    setOperatorCentre(booking.centre?.id || 'c1')
    publishSharedState(booking, nextQueue, initialBookings)
    setPaused(false)
    setNotice(t('syncStatus'))
  }

  return <>
    <PageTitle eyebrow={t('operatorLive')} title={selectedCentre.name} text={t('operationalNote')} />

    <section className="mb-6 card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold text-leaf">{t('selectOperatorCentre')}</p><p className="mt-1 text-sm text-slate-500">{selectedCentre.location} · {selectedCentre.distance}</p></div>
        <select className="input w-auto min-w-[280px]" value={operatorCentre} onChange={e => { setOperatorCentre(e.target.value); setNotice('') }} aria-label={t('selectOperatorCentre')}>
          {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </section>

    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label={t('centreStatus')} value={selectedCentre.status === 'Open' ? t('centreOpen') : selectedCentre.status === 'Busy' ? t('centreBusy') : t('centreClosed')} note={selectedCentre.name} />
      <Metric label={t('capacityUsed')} value={`${used} / ${capacity}`} note={`${t('remainingCapacity')}: ${capacity - used}`} />
      <Metric label={t('slotUtilization')} value={`${utilization}%`} note={t('demoPlan')} />
      <Metric label={t('queueHealth')} value={queueHealthy ? t('healthy') : t('attention')} note={`${queueForCentre.position} · ${queueForCentre.wait} min`} />
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-semibold text-leaf">{t('currentServing')}</p><p className="mt-1 text-3xl font-bold">{queueForCentre.served}</p><p className="mt-1 text-sm text-slate-500">{queueForCentre.served === '—' ? t('noNext') : queueForCentre.served === booking.token && operatorCentre === booking.centre?.id ? queue.status : (centreBookings.find(b => b.token === queueForCentre.served)?.status || t('booked'))} · {queueForCentre.wait} min</p></div>
          <div className="rounded-2xl bg-mist px-5 py-4 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('nextToken')}</p><p className="mt-1 text-xl font-bold">{pendingQueueBookings[0]?.token || t('noNext')}</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={callNext} disabled={paused}>{t('callNext')}</button>
          <button className="btn-secondary" onClick={() => { setPaused(p => !p); setNotice(paused ? t('resumeSuccess') : t('holdSuccess')) }}>{paused ? t('resumeQueue') : t('holdQueue')}</button>
          <button className="btn-secondary" onClick={() => go('/dashboard')}>{t('openFarmer')}</button>
        </div>
        {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{notice}</p>}
      </div>

      <div className="card">
        <h2 className="font-bold">{t('queueControl')}</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-bold">{checkedIn}</p><p className="text-xs text-slate-500">{t('checkedInCount')}</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-bold">{processing}</p><p className="text-xs text-slate-500">{t('processingCount')}</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xl font-bold">{completed}</p><p className="text-xs text-slate-500">{t('completedCount')}</p></div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest" style={{ width: `${Math.min(100, utilization)}%` }} /></div>
        <p className="mt-2 text-xs text-slate-500">{t('syncHint')}</p>
      </div>
    </section>

    <section className="card mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold">{t('bookingList')}</h2><p className="text-sm text-slate-500">{t('controls')}</p></div>
        <div className="flex flex-wrap gap-2">
          <input className="input max-w-xs" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('searchFarmer')} aria-label={t('searchFarmer')} />
          <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('filter')}><option value="all">{t('allBookings')}</option><option value="active">{t('activeOnly')}</option></select>
          <button className="btn-secondary" onClick={resetLocal}>{t('resetDemo')}</button>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="p-3">{t('tokenNumber')}</th><th className="p-3">{t('farmer')}</th><th className="p-3">{t('crop')}</th><th className="p-3">{t('quantity')}</th><th className="p-3">{t('slot')}</th><th className="p-3">{t('status')}</th><th className="p-3">{t('action')}</th></tr></thead><tbody>{visible.map(b => <tr key={b.id} className="border-b border-slate-100"><td className="p-3 font-bold">{b.token}</td><td className="p-3">{b.farmer}</td><td className="p-3">{t(cropKey[b.crop]) || b.crop}</td><td className="p-3">{b.quantity}</td><td className="p-3">{b.slot}</td><td className="p-3"><Badge t={t}>{b.status}</Badge></td><td className="p-3"><div className="flex flex-wrap gap-2"><select aria-label={`${t('action')} ${b.farmer}`} className="rounded-lg border border-slate-300 p-1.5" value={b.status} onChange={e => update(b.id, e.target.value)}><option value="Booked">{t('booked')}</option><option value="Checked in">{t('checkedIn')}</option><option value="Your Turn">{t('yourTurnStatus')}</option><option value="In progress">{t('inProgress')}</option><option value="Completed">{t('completed')}</option></select>{b.status === 'Checked in' || b.status === 'Your Turn' ? <button className="btn-primary px-3 py-1.5" onClick={() => update(b.id, 'In progress')}>{t('markInProgress')}</button> : null}{b.status === 'In progress' && <button className="btn-primary px-3 py-1.5" onClick={() => update(b.id, 'Completed')}>{t('markDone')}</button>}</div></td></tr>)}</tbody></table>{visible.length === 0 && <p className="py-8 text-center text-sm text-slate-500">{t('noActiveBookings')}</p>}</div>
    </section>
  </>
}
