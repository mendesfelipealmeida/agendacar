import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  NativeModules,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import LogoAgendacar from './components/LogoAgendacar';

const splashArtwork = require('./assets/splash.png');

function getHostFromUri(uri) {
  if (!uri) return '';

  const normalized = String(uri);
  const protocolMatch = normalized.match(/^(?:https?|exp):\/\/([^:/]+)/);
  if (protocolMatch) return protocolMatch[1];

  return normalized.match(/^([^:/]+)(?::\d+)?/)?.[1] || '';
}

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    const hostname = globalThis.location?.hostname || 'localhost';
    return `http://${hostname}:4000`;
  }

  const host = getHostFromUri(
    Constants.expoConfig?.hostUri
      || Constants.manifest2?.extra?.expoClient?.hostUri
      || Constants.manifest?.debuggerHost
      || Constants.platform?.hostUri
      || Constants.linkingUri
      || Constants.experienceUrl
      || NativeModules.SourceCode?.scriptURL
      || '',
  );

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
  }

  return `http://${host}:4000`;
}

const API_BASE_URL = getApiBaseUrl();
console.log('Agendacar API_BASE_URL:', API_BASE_URL);

const BRANDS = [
  'VOLKSWAGEN (Brasil)', 'CHEVROLET (GM Brasil)', 'FIAT (Brasil)',
  'HONDA (Brasil)', 'TOYOTA (Brasil)', 'FORD (Brasil)', 'HYUNDAI (Brasil)',
  'NISSAN (Brasil)', 'MERCEDES-BENZ (Brasil)', 'VOLVO (Brasil)',
  'RENAULT', 'JEEP', 'PEUGEOT', 'CITROEN', 'MITSUBISHI', 'CAOA Chery',
];

const MODELS = {
  'VOLKSWAGEN (Brasil)': ['Polo', 'Virtus', 'Nivus', 'T-Cross', 'Taos', 'Saveiro', 'Amarok', 'Gol', 'Voyage', 'Fox', 'Golf', 'Jetta', 'Passat', 'Santana', 'Kombi', 'Fusca'],
  'CHEVROLET (GM Brasil)': ['Onix', 'Onix Plus', 'Tracker', 'Montana', 'S10', 'Spin', 'Equinox', 'Trailblazer', 'Celta', 'Corsa', 'Prisma', 'Vectra', 'Astra', 'Omega', 'Monza', 'Kadett', 'Chevette', 'Opala', 'Agile', 'Zafira', 'Meriva'],
  'FIAT (Brasil)': ['Mobi', 'Argo', 'Cronos', 'Pulse', 'Fastback', 'Strada', 'Toro', 'Fiorino', 'Ducato', 'Uno', 'Palio', 'Siena', 'Punto', 'Linea', 'Stilo', 'Idea', 'Bravo', 'Tempra', 'Tipo', '147', 'Elba', 'Premio'],
  'HONDA (Brasil)': ['City', 'City Hatch', 'Civic', 'HR-V', 'Fit', 'Accord', 'CR-V', 'Civic antigo', 'City antigo'],
  'TOYOTA (Brasil)': ['Corolla', 'Corolla Cross', 'Hilux', 'SW4', 'Yaris', 'Etios', 'Corolla antigo', 'Fielder', 'Bandeirante'],
  'FORD (Brasil)': ['Ranger', 'Maverick', 'Territory', 'Bronco Sport', 'Ka', 'Fiesta', 'Focus', 'EcoSport', 'Fusion', 'Courier', 'Ranger antiga'],
  'HYUNDAI (Brasil)': ['HB20', 'HB20S', 'Creta', 'Creta N Line', 'HB20 antigo', 'HB20S antigo', 'Tucson', 'ix35', 'Santa Fe', 'Veracruz'],
  'NISSAN (Brasil)': ['Versa', 'Kicks', 'X-Trail', 'Frontier', 'March', 'Versa antigo', 'Sentra', 'Kicks antigo', 'Frontier antiga'],
  'MERCEDES-BENZ (Brasil)': ['Classe A', 'Classe C', 'Classe E', 'Classe S', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Classe G', 'C180', 'C200', 'C250', 'E320', 'E350', 'S500', 'ML', 'CLK', 'SLK'],
  'VOLVO (Brasil)': ['XC40', 'XC60', 'XC90', 'C40', 'EX30', 'S40', 'S60', 'S80', 'V40', 'V60', 'XC70'],
  RENAULT: ['Kwid', 'Sandero', 'Logan', 'Duster', 'Oroch', 'Captur'],
  JEEP: ['Renegade', 'Compass', 'Commander'],
  PEUGEOT: ['208', '2008', '308 antigo'],
  CITROEN: ['C3', 'C4 Cactus', 'Aircross'],
  MITSUBISHI: ['L200', 'Pajero', 'ASX', 'Eclipse Cross', 'Outlander'],
  'CAOA Chery': ['Tiggo 2', 'Tiggo 5X', 'Tiggo 7', 'Tiggo 8'],
};

const SERVICE_TYPES = ['Troca de oleo', 'Revisao', 'Pneus', 'Freios', 'Bateria', 'Suspensao', 'Outro'];
const ORDER_STATUSES = [
  'RECEBIDO',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_MANUTENCAO',
  'FINALIZANDO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
];
const SERVICE_ORDER_STATUSES = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
const ORDER_STATUS_LABELS = {
  RECEBIDO: 'Recebido',
  EM_DIAGNOSTICO: 'Em diagnostico',
  AGUARDANDO_APROVACAO: 'Aguardando aprovacao',
  EM_MANUTENCAO: 'Em manutencao',
  FINALIZANDO: 'Finalizando',
  PRONTO: 'Pronto',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};
const SERVICE_STATUS_LABELS = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluido',
  CANCELADO: 'Cancelado',
};
const FONT_REGULAR = 'Poppins_400Regular';
const FONT_SEMIBOLD = 'Poppins_600SemiBold';
const FONT_BOLD = 'Poppins_700Bold';
const COLORS = {
  background: '#0B1D33',
  surface: '#10243C',
  surfaceSoft: '#142C49',
  electric: '#1E90FF',
  gold: '#D4AF37',
  text: '#FFFFFF',
  muted: '#A6B0BC',
  border: '#243A55',
  success: '#37B26C',
  danger: '#D85757',
};

async function requestJson(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = 'Nao foi possivel concluir a operacao.';
    try {
      const body = await response.json();
      message = body.error || body.message || message;
    } catch {
      // Keep the fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatVehicle(vehicle) {
  return `${vehicle.brand} ${vehicle.model}`;
}

function formatOrderVehicle(order) {
  if (order.vehicle) return formatVehicle(order.vehicle);
  const snapshot = order.vehicleSnapshot || {};
  return `${snapshot.brand || 'Veiculo'} ${snapshot.model || ''}`.trim();
}

function formatDate(value) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR');
}

function formatDateTime(value) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleString('pt-BR');
}

function todayBrazilianDate() {
  return new Date().toLocaleDateString('pt-BR');
}

function parseBrazilianDate(value) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date.toISOString();
}

function getAreaLabel(area) {
  return area === 'mechanic' ? 'Area Oficina' : 'Area Motorista';
}

function getVehicleId(vehicle) {
  if (!vehicle) return '';
  if (typeof vehicle === 'string') return vehicle;
  return vehicle._id || vehicle.id || '';
}

function buildModelsByBrand(brandData) {
  return brandData.reduce((acc, item) => {
    acc[item.brand] = item.models;
    return acc;
  }, {});
}

function buildMaintenanceAlerts(vehicles, maintenances) {
  const latestByVehicleAndService = new Map();

  maintenances.forEach((item) => {
    if (!item.nextServiceAt) return;

    const vehicleId = getVehicleId(item.vehicle);
    if (!vehicleId) return;

    const key = `${vehicleId}:${item.serviceType}`;
    const current = latestByVehicleAndService.get(key);
    const itemDate = new Date(item.date || item.createdAt || 0).getTime();
    const currentDate = current ? new Date(current.date || current.createdAt || 0).getTime() : 0;

    if (!current || itemDate >= currentDate) {
      latestByVehicleAndService.set(key, item);
    }
  });

  return Array.from(latestByVehicleAndService.values())
    .map((item) => {
      const vehicle = typeof item.vehicle === 'object'
        ? item.vehicle
        : vehicles.find((candidate) => candidate._id === item.vehicle);

      if (!vehicle) return null;

      const baseMileage = Number(item.mileage) || 0;
      const currentMileage = Math.max(Number(vehicle.mileage) || 0, baseMileage);
      const targetMileage = baseMileage + Number(item.nextServiceAt);
      const remainingMileage = targetMileage - currentMileage;

      if (remainingMileage > 1000) return null;

      return {
        id: item._id,
        serviceType: item.serviceType,
        vehicleName: formatVehicle(vehicle),
        remainingMileage,
        targetMileage,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.remainingMileage - b.remainingMileage);
}

function getMaintenanceStatus(alerts) {
  if (!alerts.length) {
    return { label: 'Em dia', color: COLORS.success, description: 'Nenhuma revisao proxima.' };
  }

  if (alerts.some((alert) => alert.remainingMileage <= 0)) {
    return { label: 'Vencida', color: COLORS.danger, description: 'Existe manutencao atrasada.' };
  }

  return { label: 'Proxima', color: COLORS.gold, description: 'Revisao chegando nos proximos 1.000 km.' };
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [showAppSplash, setShowAppSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentArea, setCurrentArea] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [selectedServiceOrderId, setSelectedServiceOrderId] = useState('');
  const [brandOptions, setBrandOptions] = useState(BRANDS);
  const [modelsByBrand, setModelsByBrand] = useState(MODELS);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const maintenanceAlerts = useMemo(
    () => buildMaintenanceAlerts(vehicles, maintenances),
    [vehicles, maintenances],
  );

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandData = await requestJson('/api/brands');
        if (Array.isArray(brandData) && brandData.length > 0) {
          setBrandOptions(brandData.map((item) => item.brand));
          setModelsByBrand(buildModelsByBrand(brandData));
        }
      } catch {
        // Keep the local fallback so the app can still be used offline or during backend setup.
      }
    };

    loadBrands();
  }, []);

  const loadData = useCallback(async () => {
    if (!currentArea) {
      setVehicles([]);
      setMaintenances([]);
      setMechanics([]);
      setServiceOrders([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const areaQuery = `?area=${currentArea}`;
      const [vehiclesData, maintenanceData] = await Promise.all([
        requestJson(`/api/vehicles${areaQuery}`),
        requestJson(`/api/maintenances${areaQuery}`),
      ]);
      setVehicles(vehiclesData);
      setMaintenances(maintenanceData);

      if (currentArea === 'mechanic') {
        const [mechanicsResult, serviceOrdersResult] = await Promise.allSettled([
          requestJson('/api/mechanics'),
          requestJson('/api/service-orders'),
        ]);

        if (mechanicsResult.status === 'fulfilled') {
          setMechanics(mechanicsResult.value);
        } else {
          setMechanics([]);
          console.warn('Agendacar mechanics load failed:', mechanicsResult.reason?.message);
        }

        if (serviceOrdersResult.status === 'fulfilled') {
          setServiceOrders(serviceOrdersResult.value);
        } else {
          setServiceOrders([]);
          console.warn('Agendacar service orders load failed:', serviceOrdersResult.reason?.message);
        }
      } else {
        setMechanics([]);
        setServiceOrders([]);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentArea]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowAppSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  const renderScreen = () => {
    if (loading) {
      return <LoadingScreen />;
    }

    switch (currentScreen) {
      case 'vehicles':
        return (
          <VehiclesScreen
            area={currentArea}
            brandOptions={brandOptions}
            modelsByBrand={modelsByBrand}
            vehicles={vehicles}
            onNavigate={setCurrentScreen}
            onReload={loadData}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceScreen
            area={currentArea}
            vehicles={vehicles}
            maintenances={maintenances}
            onNavigate={setCurrentScreen}
            onReload={loadData}
          />
        );
      case 'mechanics':
        return (
          <MechanicsScreen
            mechanics={mechanics}
            onNavigate={setCurrentScreen}
            onReload={loadData}
          />
        );
      case 'serviceOrders':
        return (
          <ServiceOrdersScreen
            mechanics={mechanics}
            serviceOrders={serviceOrders}
            vehicles={vehicles}
            onNavigate={setCurrentScreen}
            onOpenOrder={(id) => {
              setSelectedServiceOrderId(id);
              setCurrentScreen('serviceOrderDetail');
            }}
            onReload={loadData}
          />
        );
      case 'serviceOrderDetail':
        return (
          <ServiceOrderDetailScreen
            mechanics={mechanics}
            order={serviceOrders.find((item) => item._id === selectedServiceOrderId)}
            onNavigate={setCurrentScreen}
            onReload={loadData}
          />
        );
      default:
        return (
          <HomeScreen
            errorMessage={errorMessage}
            currentArea={currentArea}
            vehicles={vehicles}
            maintenanceAlerts={maintenanceAlerts}
            mechanicsCount={mechanics.length}
            serviceOrdersCount={serviceOrders.length}
            vehiclesCount={vehicles.length}
            maintenancesCount={maintenances.length}
            onSelectArea={(area) => {
              setCurrentArea(area);
              setCurrentScreen('home');
            }}
            onChangeArea={() => {
              setCurrentArea(null);
              setCurrentScreen('home');
            }}
            onNavigate={setCurrentScreen}
            onReload={loadData}
          />
        );
    }
  };

  if (!fontsLoaded || showAppSplash) {
    return (
      <View style={styles.container}>
        <AppSplashScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="light" />
    </View>
  );
}

const AppSplashScreen = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 680,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 52,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <SafeAreaView style={styles.appSplash}>
      <View style={styles.splashGlow} />
      <Animated.View style={[styles.splashLogoBlock, { opacity, transform: [{ scale }] }]}>
        <Image source={splashArtwork} style={styles.splashArtwork} resizeMode="contain" />
      </Animated.View>
      <View style={styles.splashLoader}>
        <ActivityIndicator color={COLORS.gold} size="small" />
      </View>
    </SafeAreaView>
  );
};

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color="#ffffff" size="large" />
    <Text style={styles.loadingText}>Carregando Agendacar...</Text>
  </View>
);

const HomeScreen = ({
  currentArea,
  errorMessage,
  vehicles,
  maintenanceAlerts,
  mechanicsCount,
  serviceOrdersCount,
  vehiclesCount,
  maintenancesCount,
  onChangeArea,
  onNavigate,
  onReload,
  onSelectArea,
}) => (
  <SafeAreaView style={styles.homeShell}>
    <ScrollView style={styles.homeScroll} contentContainerStyle={styles.homeContainer}>
      {!currentArea ? (
        <WelcomeScreen onSelectArea={onSelectArea} />
      ) : (
        <>
          <PremiumDashboardHeader area={currentArea} onChangeArea={onChangeArea} />

          {errorMessage ? (
            <TouchableOpacity style={styles.errorBox} onPress={onReload}>
              <Text style={styles.errorTitle}>Backend indisponivel</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <Text style={styles.errorAction}>Toque para tentar novamente</Text>
            </TouchableOpacity>
          ) : currentArea === 'mechanic' ? (
            <PremiumWorkshopDashboard
              mechanicsCount={mechanicsCount}
              maintenancesCount={maintenancesCount}
              serviceOrdersCount={serviceOrdersCount}
              vehiclesCount={vehiclesCount}
              onNavigate={onNavigate}
            />
          ) : (
            <PremiumDriverDashboard
              alerts={maintenanceAlerts}
              maintenancesCount={maintenancesCount}
              vehicles={vehicles}
              vehiclesCount={vehiclesCount}
              onNavigate={onNavigate}
            />
          )}
        </>
      )}
    </ScrollView>

    {currentArea ? <PremiumBottomNav area={currentArea} onNavigate={onNavigate} /> : null}
  </SafeAreaView>
);

const BrandMark = ({ compact }) => (
  <View style={[styles.brandRow, compact && styles.brandRowCompact]}>
    <LogoAgendacar
      width={compact ? 134 : 270}
      height={compact ? 76 : 152}
    />
  </View>
);

const WelcomeScreen = ({ onSelectArea }) => (
  <View style={styles.welcomeContent}>
    <BrandMark />

    <View style={styles.heroBlock}>
      <Text style={styles.heroTitle}>Seu veiculo</Text>
      <Text style={styles.heroTitleGold}>sempre em dia.</Text>
      <Text style={styles.heroText}>
        Acompanhe manutencoes, controle gastos e encontre oficinas de confianca perto de voce.
      </Text>
    </View>

    <View style={styles.roleList}>
      <RoleCard
        accentColor={COLORS.electric}
        description="Acompanhe seus veiculos e mantenha tudo em dia."
        label="SOU MOTORISTA"
        onPress={() => onSelectArea('client')}
      />
      <RoleCard
        accentColor={COLORS.gold}
        description="Gerencie clientes, veiculos, servicos e sua oficina."
        label="SOU OFICINA"
        onPress={() => onSelectArea('mechanic')}
      />
    </View>

    <Text style={styles.loginHint}>Ja tenho uma conta  -  Entrar</Text>
  </View>
);

const RoleCard = ({ accentColor, description, label, onPress }) => (
  <TouchableOpacity style={styles.roleCard} onPress={onPress}>
    <View style={[styles.roleAccent, { backgroundColor: accentColor }]} />
    <View style={styles.roleTextBlock}>
      <Text style={styles.roleLabel}>{label}</Text>
      <Text style={styles.roleDescription}>{description}</Text>
    </View>
    <Text style={[styles.roleArrow, { color: accentColor }]}>›</Text>
  </TouchableOpacity>
);

const DashboardHeader = ({ area, onChangeArea }) => (
  <View style={styles.dashboardHeader}>
    <BrandMark compact />
    <View style={styles.headerActions}>
      <View style={styles.notificationDot}>
        <Text style={styles.notificationText}>!</Text>
      </View>
      <TouchableOpacity onPress={onChangeArea}>
        <Text style={styles.switchAreaText}>Trocar</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.greetingBlock}>
      <Text style={styles.greetingText}>Bem-vindo</Text>
      <Text style={styles.areaTitle}>{getAreaLabel(area)}</Text>
    </View>
  </View>
);

const DriverDashboard = ({ alerts, maintenancesCount, vehicles, vehiclesCount, onNavigate }) => {
  const status = getMaintenanceStatus(alerts);

  return (
    <>
      <PrimaryVehicleCard alerts={alerts} onNavigate={onNavigate} vehicle={vehicles[0]} />

      <View style={styles.metricsGrid}>
        <SummaryMetric label="Veiculos" value={vehiclesCount} />
        <SummaryMetric label="Servicos" value={maintenancesCount} />
      </View>

      <View style={styles.statusCard}>
        <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
        <View>
          <Text style={styles.statusTitle}>{status.label}</Text>
          <Text style={styles.statusText}>{status.description}</Text>
        </View>
      </View>

      <AlertSummary alerts={alerts} />

      <ShortcutGrid
        items={[
          { label: 'Meus Veiculos', onPress: () => onNavigate('vehicles') },
          { label: 'Historico', onPress: () => onNavigate('maintenance') },
          { label: 'Alertas' },
          { label: 'Gastos' },
        ]}
      />
    </>
  );
};

const WorkshopDashboard = ({ maintenancesCount, vehiclesCount, onNavigate }) => (
  <>
    <View style={styles.workshopPanel}>
      <SummaryMetric label="Clientes ativos" value={vehiclesCount} />
      <SummaryMetric label="Servicos do mes" value={maintenancesCount} />
      <SummaryMetric label="Pendentes" value="0" />
      <SummaryMetric label="Agendamentos" value="0" />
      <SummaryMetric label="Avaliacao media" value="-" />
    </View>

    <ShortcutGrid
      items={[
        { label: 'Clientes', onPress: () => onNavigate('vehicles') },
        { label: 'Servicos', onPress: () => onNavigate('maintenance') },
        { label: 'Agenda' },
        { label: 'Avaliacoes' },
      ]}
    />
  </>
);

const PrimaryVehicleCard = ({ alerts, onNavigate, vehicle }) => {
  if (!vehicle) {
    return (
      <View style={styles.primaryVehicleCard}>
        <Text style={styles.cardEyebrow}>Veiculo principal</Text>
        <Text style={styles.primaryVehicleTitle}>Cadastre seu primeiro veiculo</Text>
        <Text style={styles.primaryVehicleText}>Comece adicionando marca, modelo, placa, ano e quilometragem.</Text>
        <TouchableOpacity style={styles.primaryAction} onPress={() => onNavigate('vehicles')}>
          <Text style={styles.primaryActionText}>+ Adicionar veiculo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vehicleName = formatVehicle(vehicle);
  const vehicleAlert = alerts.find((alert) => alert.vehicleName === vehicleName);
  const nextService = vehicleAlert
    ? (vehicleAlert.remainingMileage <= 0
      ? `Vencida ha ${Math.abs(vehicleAlert.remainingMileage).toLocaleString('pt-BR')} km`
      : `Faltam ${vehicleAlert.remainingMileage.toLocaleString('pt-BR')} km`)
    : 'Em dia';

  return (
    <View style={styles.primaryVehicleCard}>
      <Text style={styles.cardEyebrow}>Veiculo principal</Text>
      <Text style={styles.primaryVehicleTitle}>{vehicle.brand}</Text>
      <Text style={styles.primaryVehicleModel}>{vehicle.model}</Text>
      <View style={styles.vehicleInfoGrid}>
        <Text style={styles.vehicleInfo}>Ano: {vehicle.year || '-'}</Text>
        <Text style={styles.vehicleInfo}>Placa: {vehicle.licensePlate || '-'}</Text>
        <Text style={styles.vehicleInfo}>Km: {(vehicle.mileage || 0).toLocaleString('pt-BR')}</Text>
        <Text style={styles.vehicleInfo}>Proxima revisao: {nextService}</Text>
      </View>
    </View>
  );
};

const SummaryMetric = ({ label, value }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const ShortcutGrid = ({ items }) => (
  <View style={styles.shortcutGrid}>
    {items.map((item) => (
      <TouchableOpacity
        key={item.label}
        disabled={!item.onPress}
        onPress={item.onPress}
        style={[styles.shortcutButton, !item.onPress && styles.shortcutDisabled]}
      >
        <Text style={styles.shortcutText}>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const BottomNav = ({ area, onNavigate }) => {
  const items = area === 'mechanic'
    ? [
      { label: 'Inicio' },
      { label: 'Clientes', onPress: () => onNavigate('vehicles') },
      { label: 'Servicos', onPress: () => onNavigate('maintenance') },
      { label: 'Agenda' },
      { label: 'Perfil' },
    ]
    : [
      { label: 'Inicio' },
      { label: 'Veiculos', onPress: () => onNavigate('vehicles') },
      { label: 'Oficinas' },
      { label: 'Alertas' },
      { label: 'Perfil' },
    ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          disabled={!item.onPress}
          onPress={item.onPress}
          style={styles.bottomNavItem}
        >
          <Text style={[styles.bottomNavIcon, index === 0 && styles.bottomNavActive]}>•</Text>
          <Text style={[styles.bottomNavLabel, index === 0 && styles.bottomNavActive, !item.onPress && index !== 0 && styles.bottomNavDisabled]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PremiumDashboardHeader = ({ area, onChangeArea }) => {
  const isWorkshop = area === 'mechanic';

  return (
    <View style={[styles.premiumHeader, isWorkshop && styles.premiumHeaderWorkshop]}>
      <View style={styles.premiumHeaderTop}>
        <BrandMark compact />
        <View style={styles.headerActions}>
          <View style={[styles.notificationDot, isWorkshop && styles.notificationDotWorkshop]}>
            <Text style={[styles.notificationText, isWorkshop && styles.notificationTextWorkshop]}>!</Text>
          </View>
          <TouchableOpacity onPress={onChangeArea}>
            <Text style={[styles.switchAreaText, isWorkshop && styles.switchAreaTextWorkshop]}>Trocar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.premiumGreeting}>
        <Text style={styles.greetingText}>{isWorkshop ? 'Gestao da oficina' : 'Bem-vindo de volta'}</Text>
        <Text style={styles.areaTitle}>{getAreaLabel(area)}</Text>
      </View>
    </View>
  );
};

const PremiumSectionHeader = ({ eyebrow, title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const PremiumDriverDashboard = ({ alerts, maintenancesCount, vehicles, vehiclesCount, onNavigate }) => {
  const status = getMaintenanceStatus(alerts);

  return (
    <>
      <PremiumSectionHeader eyebrow="Resumo do motorista" title="Controle do seu veiculo" />
      <PremiumVehicleCard alerts={alerts} onNavigate={onNavigate} vehicle={vehicles[0]} />

      <View style={styles.premiumMetricsGrid}>
        <PremiumMetric accent="driver" label="Veiculos" value={vehiclesCount} />
        <PremiumMetric accent="driver" label="Servicos" value={maintenancesCount} />
        <PremiumMetric accent="driver" label="Manutencoes" value={maintenancesCount} />
      </View>

      <View style={[styles.premiumStatusCard, { borderColor: status.color }]}>
        <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>{status.label}</Text>
          <Text style={styles.statusText}>{status.description}</Text>
        </View>
      </View>

      <AlertSummary alerts={alerts} />

      <PremiumShortcutGrid
        accent="driver"
        items={[
          { label: 'Meus Veiculos', helper: 'Cadastro e lista', onPress: () => onNavigate('vehicles') },
          { label: 'Historico', helper: 'Servicos realizados', onPress: () => onNavigate('maintenance') },
          { label: 'Alertas', helper: 'Em breve' },
          { label: 'Gastos', helper: 'Em breve' },
        ]}
      />
    </>
  );
};

const PremiumWorkshopDashboard = ({
  mechanicsCount,
  maintenancesCount,
  serviceOrdersCount,
  vehiclesCount,
  onNavigate,
}) => (
  <>
    <PremiumSectionHeader eyebrow="Resumo da oficina" title="Operacao em andamento" />
    <View style={styles.premiumWorkshopPanel}>
      <PremiumMetric accent="workshop" label="Clientes" value={vehiclesCount} />
      <PremiumMetric accent="workshop" label="Veiculos" value={vehiclesCount} />
      <PremiumMetric accent="workshop" label="Equipe" value={mechanicsCount} />
      <PremiumMetric accent="workshop" label="OS" value={serviceOrdersCount} />
      <PremiumMetric accent="workshop" label="Agendamentos" value="0" />
    </View>

    <PremiumShortcutGrid
      accent="workshop"
      items={[
        { label: 'Equipe', helper: 'Mecanicos', onPress: () => onNavigate('mechanics') },
        { label: 'Ordens de Servico', helper: 'OS da oficina', onPress: () => onNavigate('serviceOrders') },
        { label: 'Clientes', helper: 'Veiculos atendidos', onPress: () => onNavigate('vehicles') },
        { label: 'Servicos', helper: 'Historico da oficina', onPress: () => onNavigate('maintenance') },
      ]}
    />
  </>
);

const PremiumVehicleCard = ({ alerts, onNavigate, vehicle }) => {
  if (!vehicle) {
    return (
      <View style={styles.premiumVehicleCard}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardEyebrow}>Veiculo principal</Text>
          <View style={styles.vehicleStatusPill}>
            <Text style={styles.vehicleStatusPillText}>Novo</Text>
          </View>
        </View>
        <Text style={styles.primaryVehicleTitle}>Cadastre seu primeiro veiculo</Text>
        <Text style={styles.primaryVehicleText}>Comece adicionando marca, modelo, placa, ano e quilometragem.</Text>
        <TouchableOpacity style={styles.primaryAction} onPress={() => onNavigate('vehicles')}>
          <Text style={styles.primaryActionText}>+ Adicionar veiculo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vehicleName = formatVehicle(vehicle);
  const vehicleAlert = alerts.find((alert) => alert.vehicleName === vehicleName);
  const maintenanceStatus = vehicleAlert ? (vehicleAlert.remainingMileage <= 0 ? 'Vencida' : 'Proxima') : 'Em dia';
  const maintenanceColor = vehicleAlert
    ? (vehicleAlert.remainingMileage <= 0 ? COLORS.danger : COLORS.gold)
    : COLORS.success;
  const nextService = vehicleAlert
    ? (vehicleAlert.remainingMileage <= 0
      ? `Vencida ha ${Math.abs(vehicleAlert.remainingMileage).toLocaleString('pt-BR')} km`
      : `Faltam ${vehicleAlert.remainingMileage.toLocaleString('pt-BR')} km`)
    : 'Em dia';

  return (
    <View style={styles.premiumVehicleCard}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardEyebrow}>Veiculo principal</Text>
        <View style={[styles.vehicleStatusPill, { borderColor: maintenanceColor }]}>
          <Text style={[styles.vehicleStatusPillText, { color: maintenanceColor }]}>{maintenanceStatus}</Text>
        </View>
      </View>
      <Text style={styles.primaryVehicleTitle}>{vehicle.brand}</Text>
      <Text style={styles.primaryVehicleModel}>{vehicle.model}</Text>
      <View style={styles.vehicleInfoGrid}>
        <InfoRow label="Placa" value={vehicle.licensePlate || '-'} />
        <InfoRow label="Ano" value={vehicle.year || '-'} />
        <InfoRow label="Quilometragem" value={`${(vehicle.mileage || 0).toLocaleString('pt-BR')} km`} />
        <InfoRow label="Proxima revisao" value={nextService} />
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.vehicleInfoRow}>
    <Text style={styles.vehicleInfoLabel}>{label}</Text>
    <Text style={styles.vehicleInfoValue}>{value}</Text>
  </View>
);

const PremiumMetric = ({ accent = 'driver', label, value }) => (
  <View style={[styles.premiumMetricCard, accent === 'workshop' && styles.premiumMetricCardWorkshop]}>
    <Text style={[styles.metricValue, accent === 'workshop' && styles.metricValueWorkshop]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const PremiumShortcutGrid = ({ accent = 'driver', items }) => (
  <View style={styles.premiumShortcutGrid}>
    {items.map((item) => (
      <TouchableOpacity
        key={item.label}
        disabled={!item.onPress}
        onPress={item.onPress}
        style={[
          styles.premiumShortcutButton,
          accent === 'workshop' && styles.premiumShortcutButtonWorkshop,
          !item.onPress && styles.shortcutDisabled,
        ]}
      >
        <View style={[styles.shortcutIcon, accent === 'workshop' && styles.shortcutIconWorkshop]}>
          <Text style={[styles.shortcutIconText, accent === 'workshop' && styles.shortcutIconTextWorkshop]}>
            {item.label.slice(0, 1)}
          </Text>
        </View>
        <View style={styles.shortcutCopy}>
          <Text style={styles.shortcutText}>{item.label}</Text>
          <Text style={styles.shortcutHelper}>{item.helper}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const PremiumBottomNav = ({ area, onNavigate }) => {
  const isWorkshop = area === 'mechanic';
  const activeColor = isWorkshop ? COLORS.gold : COLORS.electric;
  const items = isWorkshop
    ? [
      { label: 'Inicio', icon: 'I' },
      { label: 'Clientes', icon: 'C', onPress: () => onNavigate('vehicles') },
      { label: 'OS', icon: 'O', onPress: () => onNavigate('serviceOrders') },
      { label: 'Equipe', icon: 'E', onPress: () => onNavigate('mechanics') },
      { label: 'Perfil', icon: 'P' },
    ]
    : [
      { label: 'Inicio', icon: 'I' },
      { label: 'Veiculos', icon: 'V', onPress: () => onNavigate('vehicles') },
      { label: 'Oficinas', icon: 'O' },
      { label: 'Alertas', icon: 'A' },
      { label: 'Perfil', icon: 'P' },
    ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          disabled={!item.onPress}
          onPress={item.onPress}
          style={styles.bottomNavItem}
        >
          <View
            style={[
              styles.bottomNavIconWrap,
              index === 0 && {
                backgroundColor: isWorkshop ? '#211F16' : '#0A2748',
                borderColor: activeColor,
              },
            ]}
          >
            <Text style={[styles.bottomNavIcon, index === 0 && { color: activeColor }]}>{item.icon}</Text>
          </View>
          <Text
            style={[
              styles.bottomNavLabel,
              index === 0 && { color: activeColor },
              !item.onPress && index !== 0 && styles.bottomNavDisabled,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AlertSummary = ({ alerts }) => {
  if (!alerts.length) {
    return (
      <View style={styles.alertPanelOk}>
        <Text style={styles.alertPanelTitle}>Manutencoes em dia</Text>
        <Text style={styles.alertPanelText}>Nenhuma revisao vencida ou proxima nos proximos 1.000 km.</Text>
      </View>
    );
  }

  return (
    <View style={styles.alertPanel}>
      <Text style={styles.alertPanelTitle}>Alertas de manutencao</Text>
      {alerts.slice(0, 3).map((alert) => (
        <View key={`${alert.id}-${alert.serviceType}`} style={styles.alertItem}>
          <Text style={styles.alertItemTitle}>{alert.serviceType}</Text>
          <Text style={styles.alertPanelText}>{alert.vehicleName}</Text>
          <Text style={styles.alertPanelText}>
            {alert.remainingMileage <= 0
              ? `Vencida ha ${Math.abs(alert.remainingMileage).toLocaleString('pt-BR')} km`
              : `Faltam ${alert.remainingMileage.toLocaleString('pt-BR')} km`}
          </Text>
        </View>
      ))}
    </View>
  );
};

const VehiclesScreen = ({ area, brandOptions, modelsByBrand, vehicles, onNavigate, onReload }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [saving, setSaving] = useState(false);

  const availableModels = useMemo(() => modelsByBrand[selectedBrand] || [], [modelsByBrand, selectedBrand]);

  const resetForm = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setOwnerName('');
    setLicensePlate('');
    setYear('');
    setMileage('');
  };

  const handleSaveVehicle = async () => {
    if (!selectedBrand || !selectedModel || !ownerName.trim() || !licensePlate.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha marca, modelo, proprietario e placa.');
      return;
    }

    try {
      setSaving(true);
      await requestJson('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          brand: selectedBrand,
          model: selectedModel,
          ownerName: ownerName.trim(),
          licensePlate: licensePlate.trim().toUpperCase(),
          year: year.trim(),
          mileage: Number.parseInt(mileage, 10) || 0,
          area,
        }),
      });
      resetForm();
      await onReload();
      Alert.alert('Sucesso', 'Veiculo cadastrado com sucesso.');
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    Alert.alert('Remover veiculo', `Remover ${formatVehicle(vehicle)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestJson(`/api/vehicles/${vehicle._id}`, { method: 'DELETE' });
            await onReload();
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screenContainer} keyboardShouldPersistTaps="handled">
      <Header
        title={area === 'mechanic' ? 'Clientes e Veiculos' : 'Meus Veiculos'}
        subtitle={getAreaLabel(area)}
        onBack={() => onNavigate('home')}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Marca *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
          {brandOptions.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[styles.optionButton, selectedBrand === brand && styles.optionButtonSelected]}
              onPress={() => {
                setSelectedBrand(brand);
                setSelectedModel('');
              }}
            >
              <Text style={[styles.optionButtonText, selectedBrand === brand && styles.optionButtonTextSelected]}>
                {brand}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedBrand ? (
          <>
            <Text style={styles.label}>Modelo *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
              {availableModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[styles.smallOptionButton, selectedModel === model && styles.smallOptionButtonSelected]}
                  onPress={() => setSelectedModel(model)}
                >
                  <Text style={[styles.smallOptionButtonText, selectedModel === model && styles.optionButtonTextSelected]}>
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}

        <Input
          label={area === 'mechanic' ? 'Nome do cliente *' : 'Nome do proprietario *'}
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="Ex: Felipe Silva"
        />
        <Input label="Placa *" value={licensePlate} onChangeText={setLicensePlate} placeholder="ABC-1234" autoCapitalize="characters" />
        <Input label="Ano" value={year} onChangeText={setYear} placeholder="2024" keyboardType="numeric" />
        <Input label="Quilometragem" value={mileage} onChangeText={setMileage} placeholder="0" keyboardType="numeric" />

        <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSaveVehicle} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar Veiculo'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>{area === 'mechanic' ? 'Veiculos de Clientes' : 'Meus Veiculos Cadastrados'}</Text>
        {vehicles.length === 0 ? (
          <EmptyState text="Nenhum veiculo cadastrado ainda." />
        ) : (
          vehicles.map((vehicle) => (
            <View key={vehicle._id} style={styles.card}>
              <Text style={styles.cardTitle}>{formatVehicle(vehicle)}</Text>
              <Text style={styles.cardInfo}>{area === 'mechanic' ? 'Cliente' : 'Proprietario'}: {vehicle.ownerName || '-'}</Text>
              <Text style={styles.cardInfo}>Placa: {vehicle.licensePlate || '-'}</Text>
              <Text style={styles.cardInfo}>Ano: {vehicle.year || '-'}</Text>
              <Text style={styles.cardInfo}>Km: {(vehicle.mileage || 0).toLocaleString('pt-BR')}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteVehicle(vehicle)}>
                <Text style={styles.deleteButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const MaintenanceScreen = ({ area, vehicles, maintenances, onNavigate, onReload }) => {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?._id || '');
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [workshopName, setWorkshopName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayBrazilianDate());
  const [mileage, setMileage] = useState('');
  const [nextServiceAt, setNextServiceAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vehicleId && vehicles[0]?._id) {
      setVehicleId(vehicles[0]._id);
    }
  }, [vehicleId, vehicles]);

  const resetForm = () => {
    setWorkshopName('');
    setDescription('');
    setDate(todayBrazilianDate());
    setMileage('');
    setNextServiceAt('');
  };

  const handleSaveMaintenance = async () => {
    if (!vehicleId || !serviceType) {
      Alert.alert('Campos obrigatorios', 'Cadastre e selecione um veiculo antes de salvar.');
      return;
    }

    const parsedDate = parseBrazilianDate(date);
    if (!parsedDate) {
      Alert.alert('Data invalida', 'Use o formato dia/mes/ano. Exemplo: 01/05/2026.');
      return;
    }

    try {
      setSaving(true);
      await requestJson('/api/maintenances', {
        method: 'POST',
        body: JSON.stringify({
          vehicle: vehicleId,
          serviceType,
          workshopName: area === 'client' ? workshopName.trim() : '',
          description: description.trim(),
          date: parsedDate,
          mileage: Number.parseInt(mileage, 10) || 0,
          nextServiceAt: Number.parseInt(nextServiceAt, 10) || undefined,
          area,
        }),
      });
      resetForm();
      await onReload();
      Alert.alert('Sucesso', 'Manutencao registrada com sucesso.');
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaintenance = (maintenance) => {
    Alert.alert('Remover manutencao', `Remover ${maintenance.serviceType}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestJson(`/api/maintenances/${maintenance._id}`, { method: 'DELETE' });
            await onReload();
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screenContainer} keyboardShouldPersistTaps="handled">
      <Header
        title={area === 'mechanic' ? 'Servicos da Oficina' : 'Meu Historico'}
        subtitle={getAreaLabel(area)}
        onBack={() => onNavigate('home')}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Veiculo *</Text>
        {vehicles.length === 0 ? (
          <TouchableOpacity style={styles.warningBox} onPress={() => onNavigate('vehicles')}>
            <Text style={styles.warningText}>Cadastre um veiculo para registrar manutencoes.</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle._id}
                style={[styles.optionButton, vehicleId === vehicle._id && styles.optionButtonSelected]}
                onPress={() => setVehicleId(vehicle._id)}
              >
                <Text style={[styles.optionButtonText, vehicleId === vehicle._id && styles.optionButtonTextSelected]}>
                  {formatVehicle(vehicle)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Servico *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
          {SERVICE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.smallOptionButton, serviceType === type && styles.smallOptionButtonSelected]}
              onPress={() => setServiceType(type)}
            >
              <Text style={[styles.smallOptionButtonText, serviceType === type && styles.optionButtonTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {area === 'client' ? (
          <Input
            label="Nome da oficina"
            value={workshopName}
            onChangeText={setWorkshopName}
            placeholder="Ex: Oficina Central"
          />
        ) : null}

        <Input label="Data" value={date} onChangeText={setDate} placeholder="01/05/2026" />
        <Input label="Quilometragem" value={mileage} onChangeText={setMileage} placeholder="0" keyboardType="numeric" />
        <Input label="Intervalo ate proxima revisao (km)" value={nextServiceAt} onChangeText={setNextServiceAt} placeholder="Ex: 5000" keyboardType="numeric" />
        <Input
          label="Descricao"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: troca de oleo e filtro"
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, (saving || vehicles.length === 0) && styles.disabledButton]}
          onPress={handleSaveMaintenance}
          disabled={saving || vehicles.length === 0}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar Manutencao'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>{area === 'mechanic' ? 'Servicos Registrados' : 'Meu Controle de Manutencoes'}</Text>
        {maintenances.length === 0 ? (
          <EmptyState text="Nenhuma manutencao registrada ainda." />
        ) : (
          maintenances.map((item) => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.serviceType}</Text>
              <Text style={styles.cardInfo}>Veiculo: {item.vehicle ? formatVehicle(item.vehicle) : '-'}</Text>
              {area === 'client' ? <Text style={styles.cardInfo}>Oficina: {item.workshopName || '-'}</Text> : null}
              <Text style={styles.cardInfo}>Data: {formatDate(item.date)}</Text>
              <Text style={styles.cardInfo}>Km: {(item.mileage || 0).toLocaleString('pt-BR')}</Text>
              {item.nextServiceAt ? <Text style={styles.cardInfo}>Intervalo: {item.nextServiceAt.toLocaleString('pt-BR')} km</Text> : null}
              {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteMaintenance(item)}>
                <Text style={styles.deleteButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const MechanicsScreen = ({ mechanics, onNavigate, onReload }) => {
  const [editingMechanic, setEditingMechanic] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingMechanic(null);
    setName('');
    setRole('');
    setPhone('');
  };

  const startEdit = (mechanic) => {
    setEditingMechanic(mechanic);
    setName(mechanic.name || '');
    setRole(mechanic.role || '');
    setPhone(mechanic.phone || '');
  };

  const handleSave = async () => {
    if (!name.trim() || !role.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha nome e funcao do mecanico.');
      return;
    }

    try {
      setSaving(true);
      await requestJson(editingMechanic ? `/api/mechanics/${editingMechanic._id}` : '/api/mechanics', {
        method: editingMechanic ? 'PUT' : 'POST',
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          phone: phone.trim(),
        }),
      });
      resetForm();
      await onReload();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (mechanic) => {
    try {
      await requestJson(`/api/mechanics/${mechanic._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !mechanic.active }),
      });
      await onReload();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <ScrollView style={styles.screenContainer} keyboardShouldPersistTaps="handled">
      <Header title="Equipe da Oficina" subtitle="Mecanicos e funcionarios" onBack={() => onNavigate('home')} />

      <View style={styles.form}>
        <Input label="Nome *" value={name} onChangeText={setName} placeholder="Ex: Joao Silva" />
        <Input label="Funcao *" value={role} onChangeText={setRole} placeholder="Ex: Mecanico geral" />
        <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="Opcional" keyboardType="phone-pad" />

        <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : editingMechanic ? 'Salvar Alteracoes' : 'Cadastrar Mecanico'}</Text>
        </TouchableOpacity>
        {editingMechanic ? (
          <TouchableOpacity style={styles.secondaryAction} onPress={resetForm}>
            <Text style={styles.secondaryActionText}>Cancelar edicao</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>Mecanicos cadastrados</Text>
        {mechanics.length === 0 ? (
          <EmptyState text="Nenhum mecanico cadastrado ainda." />
        ) : (
          mechanics.map((mechanic) => (
            <View key={mechanic._id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{mechanic.name}</Text>
                <View style={[styles.vehicleStatusPill, { borderColor: mechanic.active ? COLORS.success : COLORS.muted }]}>
                  <Text style={[styles.vehicleStatusPillText, { color: mechanic.active ? COLORS.success : COLORS.muted }]}>
                    {mechanic.active ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardInfo}>Funcao: {mechanic.role}</Text>
              <Text style={styles.cardInfo}>Telefone: {mechanic.phone || '-'}</Text>
              <Text style={styles.cardInfo}>Cadastro: {formatDate(mechanic.createdAt)}</Text>
              <View style={styles.cardActionsRow}>
                <TouchableOpacity style={styles.smallActionButton} onPress={() => startEdit(mechanic)}>
                  <Text style={styles.smallActionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallActionButton} onPress={() => handleToggleActive(mechanic)}>
                  <Text style={styles.smallActionText}>{mechanic.active ? 'Desativar' : 'Ativar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const ServiceOrdersScreen = ({
  mechanics,
  serviceOrders,
  vehicles,
  onNavigate,
  onOpenOrder,
  onReload,
}) => {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?._id || '');
  const [entryMileage, setEntryMileage] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vehicleId && vehicles[0]?._id) setVehicleId(vehicles[0]._id);
  }, [vehicleId, vehicles]);

  const handleCreateOrder = async () => {
    if (!vehicleId) {
      Alert.alert('Veiculo obrigatorio', 'Cadastre e selecione um veiculo de cliente para abrir uma OS.');
      return;
    }

    try {
      setSaving(true);
      const services = serviceDescription.trim()
        ? [{
          description: serviceDescription.trim(),
          mechanic: mechanicId || undefined,
        }]
        : [];

      const saved = await requestJson('/api/service-orders', {
        method: 'POST',
        body: JSON.stringify({
          vehicle: vehicleId,
          entryMileage: Number.parseInt(entryMileage, 10) || undefined,
          customerNotes: customerNotes.trim(),
          services,
        }),
      });

      setEntryMileage('');
      setCustomerNotes('');
      setServiceDescription('');
      setMechanicId('');
      await onReload();
      onOpenOrder(saved._id);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screenContainer} keyboardShouldPersistTaps="handled">
      <Header title="Ordens de Servico" subtitle="Controle da oficina" onBack={() => onNavigate('home')} />

      <View style={styles.form}>
        <Text style={styles.label}>Veiculo *</Text>
        {vehicles.length === 0 ? (
          <TouchableOpacity style={styles.warningBox} onPress={() => onNavigate('vehicles')}>
            <Text style={styles.warningText}>Cadastre um veiculo de cliente antes de abrir uma OS.</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle._id}
                style={[styles.optionButton, vehicleId === vehicle._id && styles.optionButtonSelected]}
                onPress={() => setVehicleId(vehicle._id)}
              >
                <Text style={[styles.optionButtonText, vehicleId === vehicle._id && styles.optionButtonTextSelected]}>
                  {formatVehicle(vehicle)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Input label="Quilometragem de entrada" value={entryMileage} onChangeText={setEntryMileage} placeholder="0" keyboardType="numeric" />
        <Input
          label="Reclamacao/observacoes do cliente"
          value={customerNotes}
          onChangeText={setCustomerNotes}
          placeholder="Ex: barulho ao frear"
          multiline
        />
        <Input
          label="Primeiro servico solicitado"
          value={serviceDescription}
          onChangeText={setServiceDescription}
          placeholder="Ex: troca de oleo"
        />

        <MechanicSelector mechanics={mechanics} selectedId={mechanicId} onSelect={setMechanicId} />

        <TouchableOpacity
          style={[styles.saveButton, (saving || vehicles.length === 0) && styles.disabledButton]}
          onPress={handleCreateOrder}
          disabled={saving || vehicles.length === 0}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Abrindo...' : 'Abrir OS'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>Ordens abertas e historico</Text>
        {serviceOrders.length === 0 ? (
          <EmptyState text="Nenhuma ordem de servico cadastrada ainda." />
        ) : (
          serviceOrders.map((order) => (
            <TouchableOpacity key={order._id} style={styles.card} onPress={() => onOpenOrder(order._id)}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>OS {order.number}</Text>
                <View style={[styles.vehicleStatusPill, { borderColor: COLORS.gold }]}>
                  <Text style={[styles.vehicleStatusPillText, { color: COLORS.gold }]}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardInfo}>Veiculo: {formatOrderVehicle(order)}</Text>
              <Text style={styles.cardInfo}>Cliente: {order.customerName || '-'}</Text>
              <Text style={styles.cardInfo}>Entrada: {formatDateTime(order.entryAt)}</Text>
              <Text style={styles.cardInfo}>Servicos: {order.services?.length || 0}</Text>
              <Text style={styles.errorAction}>Abrir detalhes</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const ServiceOrderDetailScreen = ({ mechanics, order, onNavigate, onReload }) => {
  const [serviceDescription, setServiceDescription] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!order) {
    return (
      <ScrollView style={styles.screenContainer}>
        <Header title="Ordem de Servico" subtitle="Detalhes" onBack={() => onNavigate('serviceOrders')} />
        <View style={styles.form}>
          <EmptyState text="OS nao encontrada. Volte para a lista e tente novamente." />
        </View>
      </ScrollView>
    );
  }

  const updateOrderStatus = async (status) => {
    try {
      await requestJson(`/api/service-orders/${order._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await onReload();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const addService = async () => {
    if (!serviceDescription.trim()) {
      Alert.alert('Servico obrigatorio', 'Informe a descricao do servico.');
      return;
    }

    try {
      setSaving(true);
      await requestJson(`/api/service-orders/${order._id}/services`, {
        method: 'POST',
        body: JSON.stringify({
          description: serviceDescription.trim(),
          mechanic: mechanicId || undefined,
          notes: serviceNotes.trim(),
        }),
      });
      setServiceDescription('');
      setMechanicId('');
      setServiceNotes('');
      await onReload();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateService = async (serviceId, payload) => {
    try {
      await requestJson(`/api/service-orders/${order._id}/services/${serviceId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await onReload();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <ScrollView style={styles.screenContainer} keyboardShouldPersistTaps="handled">
      <Header title={`OS ${order.number}`} subtitle={ORDER_STATUS_LABELS[order.status] || order.status} onBack={() => onNavigate('serviceOrders')} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{formatOrderVehicle(order)}</Text>
        <Text style={styles.cardInfo}>Cliente: {order.customerName || '-'}</Text>
        <Text style={styles.cardInfo}>Placa: {order.vehicle?.licensePlate || order.vehicleSnapshot?.licensePlate || '-'}</Text>
        <Text style={styles.cardInfo}>Entrada: {formatDateTime(order.entryAt)}</Text>
        <Text style={styles.cardInfo}>Km entrada: {(order.entryMileage || 0).toLocaleString('pt-BR')}</Text>
        {order.customerNotes ? <Text style={styles.cardDescription}>{order.customerNotes}</Text> : null}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Status da OS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
          {ORDER_STATUSES.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.smallOptionButton, order.status === status && styles.smallOptionButtonSelected]}
              onPress={() => updateOrderStatus(status)}
            >
              <Text style={[styles.smallOptionButtonText, order.status === status && styles.optionButtonTextSelected]}>
                {ORDER_STATUS_LABELS[status]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.form}>
        <Text style={styles.listTitle}>Adicionar servico</Text>
        <Input label="Descricao *" value={serviceDescription} onChangeText={setServiceDescription} placeholder="Ex: troca das pastilhas" />
        <MechanicSelector mechanics={mechanics} selectedId={mechanicId} onSelect={setMechanicId} />
        <Input label="Observacao" value={serviceNotes} onChangeText={setServiceNotes} placeholder="Opcional" multiline />
        <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={addService} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Adicionando...' : 'Adicionar Servico'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>Servicos da OS</Text>
        {order.services?.length ? (
          order.services.map((service) => (
            <View key={service._id} style={styles.card}>
              <Text style={styles.cardTitle}>{service.description}</Text>
              <Text style={styles.cardInfo}>Responsavel: {service.mechanicName || service.mechanic?.name || 'Nao atribuido'}</Text>
              <Text style={styles.cardInfo}>Funcao: {service.mechanicRole || service.mechanic?.role || '-'}</Text>
              <Text style={styles.cardInfo}>Status: {SERVICE_STATUS_LABELS[service.status] || service.status}</Text>
              {service.startedAt ? <Text style={styles.cardInfo}>Inicio: {formatDateTime(service.startedAt)}</Text> : null}
              {service.completedAt ? <Text style={styles.cardInfo}>Conclusao: {formatDateTime(service.completedAt)}</Text> : null}
              {service.notes ? <Text style={styles.cardDescription}>{service.notes}</Text> : null}

              <MechanicSelector
                compact
                mechanics={mechanics}
                selectedId={getVehicleId(service.mechanic)}
                onSelect={(id) => updateService(service._id, { mechanic: id })}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                {SERVICE_ORDER_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.smallOptionButton, service.status === status && styles.smallOptionButtonSelected]}
                    onPress={() => updateService(service._id, { status })}
                  >
                    <Text style={[styles.smallOptionButtonText, service.status === status && styles.optionButtonTextSelected]}>
                      {SERVICE_STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        ) : (
          <EmptyState text="Nenhum servico adicionado nesta OS." />
        )}
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>Auditoria</Text>
        {order.auditEvents?.length ? (
          order.auditEvents.slice().reverse().map((event, index) => (
            <View key={`${event.createdAt}-${index}`} style={styles.auditItem}>
              <Text style={styles.auditTitle}>{event.type}</Text>
              <Text style={styles.cardInfo}>{event.description}</Text>
              <Text style={styles.cardInfo}>{formatDateTime(event.createdAt)}</Text>
            </View>
          ))
        ) : (
          <EmptyState text="Nenhum evento registrado ainda." />
        )}
      </View>
    </ScrollView>
  );
};

const MechanicSelector = ({ compact, mechanics, selectedId, onSelect }) => {
  const activeMechanics = mechanics.filter((mechanic) => mechanic.active);

  return (
    <>
      <Text style={styles.label}>{compact ? 'Trocar responsavel' : 'Mecanico responsavel'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
        <TouchableOpacity
          style={[styles.smallOptionButton, !selectedId && styles.smallOptionButtonSelected]}
          onPress={() => onSelect('')}
        >
          <Text style={[styles.smallOptionButtonText, !selectedId && styles.optionButtonTextSelected]}>
            Sem responsavel
          </Text>
        </TouchableOpacity>
        {activeMechanics.map((mechanic) => (
          <TouchableOpacity
            key={mechanic._id}
            style={[styles.smallOptionButton, selectedId === mechanic._id && styles.smallOptionButtonSelected]}
            onPress={() => onSelect(mechanic._id)}
          >
            <Text style={[styles.smallOptionButtonText, selectedId === mechanic._id && styles.optionButtonTextSelected]}>
              {mechanic.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const Header = ({ title, subtitle, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>Voltar</Text>
    </TouchableOpacity>
    <View style={styles.headerTitleBlock}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  </View>
);

const Input = ({ label, multiline, style, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput, style]}
      placeholderTextColor="#64748B"
      multiline={multiline}
      {...props}
    />
  </View>
);

const EmptyState = ({ text }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: '#f5f5f7',
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    marginTop: 16,
  },
  appSplash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06111F',
    overflow: 'hidden',
    paddingHorizontal: 28,
  },
  splashGlow: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#102A48',
    opacity: 0.48,
    shadowColor: COLORS.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 42,
    elevation: 8,
  },
  splashLogoBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashArtwork: {
    aspectRatio: 1,
    maxHeight: 560,
    maxWidth: 560,
    width: '100%',
  },
  splashLoader: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeShell: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  homeContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 104,
    paddingTop: 18,
    backgroundColor: COLORS.background,
  },
  homeScroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 680,
  },
  brandRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRowCompact: {
    alignItems: 'flex-start',
  },
  heroBlock: {
    marginTop: 48,
  },
  heroTitle: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 40,
    lineHeight: 46,
  },
  heroTitleGold: {
    color: COLORS.gold,
    fontFamily: FONT_BOLD,
    fontSize: 40,
    lineHeight: 46,
  },
  heroText: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },
  roleList: {
    gap: 14,
    marginTop: 42,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 94,
    overflow: 'hidden',
    paddingRight: 18,
  },
  roleAccent: {
    alignSelf: 'stretch',
    width: 4,
  },
  roleTextBlock: {
    flex: 1,
    padding: 18,
  },
  roleLabel: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 15,
    lineHeight: 22,
  },
  roleDescription: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  roleArrow: {
    fontFamily: FONT_BOLD,
    fontSize: 28,
  },
  loginHint: {
    color: COLORS.muted,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 30,
    textAlign: 'center',
  },
  dashboardHeader: {
    marginBottom: 22,
  },
  premiumHeader: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 22,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 4,
  },
  premiumHeaderWorkshop: {
    borderColor: '#574A25',
  },
  premiumHeaderTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  notificationDot: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  notificationText: {
    color: COLORS.gold,
    fontFamily: FONT_BOLD,
    fontSize: 13,
  },
  notificationDotWorkshop: {
    borderColor: COLORS.gold,
  },
  notificationTextWorkshop: {
    color: COLORS.gold,
  },
  greetingBlock: {
    marginTop: 22,
  },
  premiumGreeting: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionEyebrow: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 18,
    lineHeight: 25,
  },
  primaryVehicleCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
  },
  premiumVehicleCard: {
    backgroundColor: COLORS.surface,
    borderColor: '#294769',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
    shadowColor: COLORS.electric,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vehicleStatusPill: {
    borderColor: COLORS.electric,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vehicleStatusPillText: {
    color: COLORS.electric,
    fontFamily: FONT_BOLD,
    fontSize: 11,
    lineHeight: 15,
  },
  cardEyebrow: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  primaryVehicleTitle: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 22,
    lineHeight: 29,
  },
  primaryVehicleModel: {
    color: COLORS.muted,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 2,
  },
  primaryVehicleText: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  primaryAction: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.electric,
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryActionText: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 13,
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: COLORS.gold,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    padding: 13,
  },
  secondaryActionText: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
  },
  vehicleInfoGrid: {
    gap: 8,
    marginTop: 14,
  },
  vehicleInfoRow: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  vehicleInfoLabel: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 18,
  },
  vehicleInfoValue: {
    color: COLORS.text,
    flexShrink: 1,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 12,
    textAlign: 'right',
  },
  vehicleInfo: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 19,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  premiumMetricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceSoft,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  premiumMetricCard: {
    flex: 1,
    flexBasis: '30%',
    backgroundColor: COLORS.surfaceSoft,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 86,
    padding: 12,
  },
  premiumMetricCardWorkshop: {
    borderColor: '#4E4428',
  },
  metricValue: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 22,
    lineHeight: 29,
  },
  metricLabel: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 18,
  },
  metricValueWorkshop: {
    color: COLORS.gold,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 14,
  },
  premiumStatusCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 14,
  },
  statusCopy: {
    flex: 1,
  },
  statusIndicator: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  statusTitle: {
    color: COLORS.text,
    fontFamily: FONT_BOLD,
    fontSize: 15,
    lineHeight: 22,
  },
  statusText: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 18,
  },
  workshopPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  premiumWorkshopPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  premiumShortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 16,
  },
  premiumShortcutButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: 12,
    minHeight: 76,
    padding: 12,
  },
  premiumShortcutButtonWorkshop: {
    borderColor: '#4E4428',
  },
  shortcutDisabled: {
    opacity: 0.48,
  },
  shortcutIcon: {
    alignItems: 'center',
    backgroundColor: '#0A2748',
    borderColor: COLORS.electric,
    borderRadius: 10,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  shortcutIconWorkshop: {
    backgroundColor: '#211F16',
    borderColor: COLORS.gold,
  },
  shortcutIconText: {
    color: COLORS.electric,
    fontFamily: FONT_BOLD,
    fontSize: 13,
  },
  shortcutIconTextWorkshop: {
    color: COLORS.gold,
  },
  shortcutCopy: {
    flex: 1,
  },
  shortcutText: {
    color: COLORS.text,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    lineHeight: 21,
  },
  shortcutHelper: {
    color: COLORS.muted,
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  bottomNav: {
    backgroundColor: '#071526',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingBottom: 10,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
  bottomNavItem: {
    alignItems: 'center',
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  bottomNavIcon: {
    color: COLORS.muted,
    fontFamily: FONT_BOLD,
    fontSize: 16,
    lineHeight: 18,
  },
  bottomNavIconWrap: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginBottom: 2,
    width: 24,
  },
  bottomNavLabel: {
    color: COLORS.muted,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 11,
    lineHeight: 16,
  },
  bottomNavActive: {
    color: COLORS.electric,
  },
  bottomNavDisabled: {
    opacity: 0.55,
  },
  logoContainer: {
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontFamily: FONT_BOLD,
    fontSize: 42,
    letterSpacing: 0.3,
    lineHeight: 50,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  statNumber: {
    color: '#f5f5f7',
    fontFamily: FONT_BOLD,
    fontSize: 24,
    lineHeight: 31,
  },
  statLabel: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 13,
  },
  menuContainer: {
    width: '100%',
  },
  menuButton: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  areaButton: {
    backgroundColor: COLORS.surface,
    padding: 22,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.electric,
    shadowColor: COLORS.electric,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 5,
  },
  areaButtonSecondary: {
    backgroundColor: COLORS.surface,
    padding: 22,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  areaHeader: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  areaTitle: {
    color: '#F8FAFC',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 20,
    lineHeight: 28,
  },
  switchAreaText: {
    color: COLORS.electric,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  menuButtonText: {
    color: '#F8FAFC',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    lineHeight: 26,
  },
  menuButtonSubtext: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#2C1D24',
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorTitle: {
    color: COLORS.danger,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    marginTop: 4,
  },
  errorAction: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  alertPanel: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.gold,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 22,
    padding: 14,
  },
  alertPanelOk: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.success,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 22,
    padding: 14,
  },
  alertPanelTitle: {
    color: '#F8FAFC',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  alertPanelText: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 20,
  },
  alertItem: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  alertItemTitle: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    lineHeight: 21,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: COLORS.electric,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
  },
  screenTitle: {
    color: '#F8FAFC',
    fontFamily: FONT_BOLD,
    fontSize: 20,
    lineHeight: 28,
  },
  headerTitleBlock: {
    flex: 1,
  },
  screenSubtitle: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    marginTop: 2,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 15,
    color: '#E2E8F0',
    fontFamily: FONT_SEMIBOLD,
    marginBottom: 8,
    marginTop: 14,
  },
  optionScroll: {
    marginBottom: 4,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.electric,
    borderColor: COLORS.electric,
  },
  optionButtonText: {
    color: '#E2E8F0',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    lineHeight: 21,
  },
  optionButtonTextSelected: {
    color: '#ffffff',
  },
  smallOptionButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smallOptionButtonSelected: {
    backgroundColor: COLORS.electric,
    borderColor: COLORS.electric,
  },
  smallOptionButtonText: {
    color: '#E2E8F0',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 19,
  },
  inputGroup: {
    marginBottom: 2,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: '#F8FAFC',
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.electric,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.electric,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.62,
  },
  saveButtonText: {
    color: '#ffffff',
    fontFamily: FONT_BOLD,
    fontSize: 16,
    lineHeight: 23,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  listTitle: {
    fontSize: 18,
    color: '#F8FAFC',
    fontFamily: FONT_BOLD,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#F8FAFC',
    fontFamily: FONT_BOLD,
    marginBottom: 8,
  },
  cardInfo: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    marginBottom: 3,
  },
  cardDescription: {
    color: '#E2E8F0',
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    marginTop: 8,
  },
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  smallActionButton: {
    borderColor: COLORS.gold,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallActionText: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 19,
  },
  auditItem: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  auditTitle: {
    color: COLORS.gold,
    fontFamily: FONT_BOLD,
    fontSize: 13,
    lineHeight: 19,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    borderColor: COLORS.gold,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  emptyText: {
    color: '#CBD5E1',
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.gold,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  warningText: {
    color: COLORS.gold,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    lineHeight: 21,
  },
});

