'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

// Worder Logo Component
const WorderLogo = () => (
  <Image
    src="/logo.png"
    alt="Worder"
    width={130}
    height={25}
    className="object-contain"
    priority
  />
);

// Step indicator
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          index < currentStep
            ? 'w-8 bg-primary-500'
            : index === currentStep
            ? 'w-8 bg-primary-500'
            : 'w-8 bg-dark-700'
        }`}
      />
    ))}
  </div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [shopifyData, setShopifyData] = useState({
    storeName: '',
    storeDomain: '',
    accessToken: '',
  });

  const handleShopifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShopifyData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateShopifyData = () => {
    if (!shopifyData.storeName.trim()) {
      setError('Por favor, insira o nome da loja');
      return false;
    }
    if (!shopifyData.storeDomain.trim()) {
      setError('Por favor, insira o domínio da loja');
      return false;
    }
    if (!shopifyData.accessToken.trim()) {
      setError('Por favor, insira o Access Token');
      return false;
    }
    if (!shopifyData.accessToken.startsWith('shpat_')) {
      setError('O Access Token deve começar com "shpat_"');
      return false;
    }
    return true;
  };

  const handleConnectShopify = async () => {
    setError('');
    
    if (!validateShopifyData()) {
      return;
    }

    setIsLoading(true);

    try {
      // Clean domain (remove https://, trailing slashes, etc)
      let domain = shopifyData.storeDomain.trim();
      domain = domain.replace(/^https?:\/\//, '');
      domain = domain.replace(/\/$/, '');
      if (!domain.includes('.myshopify.com')) {
        domain = `${domain}.myshopify.com`;
      }

      const response = await fetch('/api/shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          storeName: shopifyData.storeName,
          storeDomain: domain,
          accessToken: shopifyData.accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar loja');
      }

      // Success - go to next step or dashboard
      setCurrentStep(1);
      
      // After a short delay, redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);

    } catch (err: any) {
      console.error('Shopify connection error:', err);
      setError(err.message || 'Erro ao conectar. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <WorderLogo />
          <p className="text-xs text-dark-500">by Convertfy</p>
        </div>

        {/* Card */}
        <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8">
          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={2} />
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Title */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#95BF47]/20 to-[#5E8E3E]/20 flex items-center justify-center">
                    <Store className="w-8 h-8 text-[#95BF47]" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Conecte sua loja Shopify
                  </h1>
                  <p className="text-dark-400">
                    Configure sua loja para começar a monitorar suas vendas
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Store Name */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={shopifyData.storeName}
                      onChange={handleShopifyChange}
                      placeholder="Ex: Minha Loja Principal"
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <p className="mt-1.5 text-xs text-dark-500">
                      Um nome para identificar sua loja no dashboard
                    </p>
                  </div>

                  {/* Store Domain */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Domínio Shopify
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="storeDomain"
                        value={shopifyData.storeDomain}
                        onChange={handleShopifyChange}
                        placeholder="minha-loja"
                        className="flex-1 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-l-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      />
                      <div className="px-4 py-3 bg-dark-800 border border-l-0 border-dark-700 rounded-r-xl text-dark-400 text-sm flex items-center">
                        .myshopify.com
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-dark-500">
                      Encontre em: Shopify Admin → Configurações → Domínios
                    </p>
                  </div>

                  {/* Access Token */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Access Token da API
                    </label>
                    <input
                      type="password"
                      name="accessToken"
                      value={shopifyData.accessToken}
                      onChange={handleShopifyChange}
                      placeholder="shpat_xxxxxxxxxxxxx"
                      className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <a
                      href="https://help.shopify.com/pt-BR/manual/apps/custom-apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
                    >
                      Como obter?
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={handleConnectShopify}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#95BF47] hover:bg-[#7ea93d] rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Conectar Loja
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSkip}
                      className="w-full py-3 px-4 text-dark-400 hover:text-white transition-colors text-sm"
                    >
                      Configurar depois
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Loja conectada com sucesso!
                </h2>
                <p className="text-dark-400 mb-6">
                  Redirecionando para o dashboard...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm text-dark-500 hover:text-dark-400 inline-flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            Precisa de ajuda?
          </a>
        </div>
      </motion.div>
    </div>
  );
}
