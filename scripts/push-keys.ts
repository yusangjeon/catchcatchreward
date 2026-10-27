/** VAPID 키 1회 생성 → Vercel 환경변수 VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 에 넣는다. 콘솔 외에는 어디에도 저장하지 않는다. */
import webpush from "web-push";
const k = webpush.generateVAPIDKeys();
console.log(`VAPID_PUBLIC_KEY=${k.publicKey}\nVAPID_PRIVATE_KEY=${k.privateKey}\nVAPID_SUBJECT=mailto:you@example.com`);
