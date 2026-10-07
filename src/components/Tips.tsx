import './Tips.css';
import gcashQr from '../images/gcash.png';

export default function Tips() {
  return (
    <section className="section tips" aria-labelledby="tips-title">
      <div className="wrap">
        <h2 id="tips-title">Enjoying the music?</h2>
        <p className="lede">If you'd like to support the music, you can send a tip 💙</p>

        <figure className="qr">
          <img
            src={gcashQr}
            width={320}
            height={320}
            loading="lazy"
            alt="GCash QR code for sending a tip to AKN"
          />
          <figcaption>Scan to send a tip</figcaption>
        </figure>
      </div>
    </section>
  );
}