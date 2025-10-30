# ⚡ CryptoFlash

> Real-time cryptocurrency portfolio tracker with smart price alerts and advanced analytics

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hinfomist/coin-nft-glow)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/hinfomist/coin-nft-glow)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://cryptoflashr.onrender.com/)

![CryptoFlash Preview](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.19-yellow) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blue)

## ✨ Features

### 🚀 Core Features
- **Real-time Price Tracking**: Live cryptocurrency prices updated every 30 seconds
- **Portfolio Analytics**: Track your investments with detailed P&L calculations
- **Smart Price Alerts**: Get email notifications when prices hit your targets
- **Advanced Filtering**: Sort by market cap, price change, gainers, losers
- **Visual Charts**: Interactive portfolio pie charts and performance metrics

### 💎 Premium Features
- **Unlimited Portfolios**: Create multiple investment portfolios
- **Unlimited Holdings**: Add as many assets as you want
- **Unlimited Alerts**: Set unlimited price alerts
- **Historical Charts**: Coming soon - advanced price history analysis
- **CSV Export**: Export your portfolio data for tax reporting
- **Priority Support**: Direct access to developer support

### 🔧 Technical Features
- **Progressive Web App**: Install as a native app on any device
- **Offline Support**: Works offline with cached data
- **Dark/Light Mode**: Automatic theme switching
- **Mobile Responsive**: Optimized for all screen sizes
- **Performance Optimized**: Lightning-fast loading and smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hinfomist/coin-nft-glow.git
   cd coin-nft-glow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm install -g gh-pages
npm run deploy:gh-pages
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Required APIs
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Payment Gateway (PayPal - Recommended for Pakistan)
VITE_PAYPAL_EMAIL=your-paypal-business-email@example.com
VITE_PAYPAL_CURRENCY=USD
VITE_PRO_PRICE=9.99

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your_mixpanel_token

# Deployment
VITE_APP_URL=https://your-domain.com
VITE_APP_ENV=production
```

## 💳 Payment Setup

### PayPal Integration (Recommended for Pakistan)

1. **Create a PayPal Business Account**: Sign up at [paypal.com/business](https://paypal.com/business)
2. **Get your PayPal email**: Use your business email in `VITE_PAYPAL_EMAIL`
3. **Test the integration**: The app will redirect users to PayPal for payment
4. **Handle webhooks**: For production, set up PayPal IPN webhooks

### Alternative Payment Gateways

If PayPal doesn't work in your region, consider these alternatives:

#### For Pakistan & South Asia:
- **JazzCash/EasyPaisa**: Popular mobile payment methods
- **Bank Transfer**: Direct bank account integration
- **Crypto Payments**: Accept Bitcoin/Ethereum payments

#### Global Alternatives:
- **Stripe**: Excellent but limited availability in Pakistan
- **Razorpay**: Good for India, may work in Pakistan
- **2Checkout**: Global coverage
- **Payoneer**: International payments

### Setting up PayPal:

1. **Business Account Setup**:
   ```bash
   # Visit: https://paypal.com/business
   # Complete verification process
   # Get your business email
   ```

2. **Environment Configuration**:
   ```env
   VITE_PAYPAL_EMAIL=your-business-paypal@example.com
   VITE_PAYPAL_CURRENCY=USD
   VITE_PRO_PRICE=9.99
   ```

3. **Testing**:
   - Use PayPal sandbox for testing
   - Test both success and cancel flows
   - Verify subscription activation

### Subscription Management:

- **Automatic Billing**: PayPal handles monthly recurring payments
- **User Management**: Subscriptions stored in localStorage (upgrade to database for production)
- **Cancellation**: Users can cancel through PayPal account
- **Refunds**: Handle refund requests manually or through PayPal

## 🏗️ Project Structure

```
cryptoflash/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── favicon.ico
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   └── ...
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and API functions
│   ├── pages/                # Page components
│   └── ...
├── vercel.json               # Vercel deployment config
├── netlify.toml              # Netlify deployment config
└── package.json
```

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Shadcn/ui
- **State Management**: React Context + TanStack Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify/GitHub Pages

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Bundle Size**: <200KB gzipped
- **Core Web Vitals**: All green scores

## 🔒 Security

- **Content Security Policy**: Strict CSP headers
- **HTTPS Only**: Enforced SSL/TLS
- **Secure Headers**: X-Frame-Options, HSTS, etc.
- **Data Encryption**: Client-side data encryption
- **Input Validation**: Comprehensive form validation

## 📱 Progressive Web App

CryptoFlash is a fully functional PWA with:
- **App-like Experience**: Install on desktop/mobile
- **Offline Functionality**: Cached data and offline fallbacks
- **Push Notifications**: Price alert notifications
- **Background Sync**: Automatic data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CoinGecko API**: Cryptocurrency price data
- **EmailJS**: Email notification service
- **Shadcn/ui**: Beautiful UI components
- **Vercel**: Hosting and deployment platform

## 📞 Support

- **Email**: support@cryptoflash.app
- **Twitter**: [@hamzaaslam](https://twitter.com/hamzaaslam)
- **GitHub Issues**: [Report bugs](https://github.com/hinfomist/coin-nft-glow/issues)

## 🚀 Roadmap

### Version 1.1.0
- [ ] Historical price charts
- [ ] Advanced portfolio analytics
- [ ] Social trading features
- [ ] Multi-currency support

### Version 1.2.0
- [ ] NFT portfolio tracking
- [ ] DeFi yield farming calculator
- [ ] Tax reporting tools
- [ ] Mobile app (React Native)

### Version 2.0.0
- [ ] Real-time trading
- [ ] Advanced charting with indicators
- [ ] Social features and communities
- [ ] AI-powered insights

---

**Built with ❤️ by [Hamza Aslam](https://twitter.com/hamzaaslam)**

*Track your crypto portfolio like a pro - free forever, upgrade for premium features.*
