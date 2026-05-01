import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  Platform,
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
import { StatusBar } from 'expo-status-bar';
import LogoAgendacar from './components/LogoAgendacar';

function getApiBaseUrl() {
  if (Platform.OS === 'web') {
    const hostname = globalThis.location?.hostname || 'localhost';
    return `http://${hostname}:4000`;
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL || '';
  const host = scriptUrl.match(/\/\/([^:/]+)/)?.[1];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
  }

  return `http://${host}:4000`;
}

const API_BASE_URL = getApiBaseUrl();

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
const FONT_REGULAR = 'Poppins_400Regular';
const FONT_SEMIBOLD = 'Poppins_600SemiBold';
const FONT_BOLD = 'Poppins_700Bold';

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

function formatDate(value) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR');
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
  return area === 'mechanic' ? 'Area Mecanico' : 'Area Cliente';
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentArea, setCurrentArea] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!currentArea) {
      setVehicles([]);
      setMaintenances([]);
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
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentArea]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderScreen = () => {
    if (!fontsLoaded || loading) {
      return <LoadingScreen />;
    }

    switch (currentScreen) {
      case 'vehicles':
        return <VehiclesScreen area={currentArea} vehicles={vehicles} onNavigate={setCurrentScreen} onReload={loadData} />;
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
      default:
        return (
          <HomeScreen
            errorMessage={errorMessage}
            currentArea={currentArea}
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

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="light" />
    </View>
  );
}

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color="#ffffff" size="large" />
    <Text style={styles.loadingText}>Carregando Agendacar...</Text>
  </View>
);

const HomeScreen = ({
  currentArea,
  errorMessage,
  vehiclesCount,
  maintenancesCount,
  onChangeArea,
  onNavigate,
  onReload,
  onSelectArea,
}) => (
  <View style={styles.homeContainer}>
    <View style={styles.logoContainer}>
      <LogoAgendacar width={188} height={188} />
    </View>
    <Text style={styles.title}>Agendacar</Text>
    <Text style={styles.subtitle}>Organize a manutencao do seu veiculo</Text>

    {!currentArea ? (
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.areaButton} onPress={() => onSelectArea('client')}>
          <Text style={styles.menuButtonText}>Area Cliente</Text>
          <Text style={styles.menuButtonSubtext}>Controle pessoal do seu veiculo, revisoes e historico</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.areaButtonSecondary} onPress={() => onSelectArea('mechanic')}>
          <Text style={styles.menuButtonText}>Area Mecanico</Text>
          <Text style={styles.menuButtonSubtext}>Gerencie clientes, veiculos atendidos e servicos</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <>
        <View style={styles.areaHeader}>
          <Text style={styles.areaTitle}>{getAreaLabel(currentArea)}</Text>
          <TouchableOpacity onPress={onChangeArea}>
            <Text style={styles.switchAreaText}>Trocar area</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <TouchableOpacity style={styles.errorBox} onPress={onReload}>
            <Text style={styles.errorTitle}>Backend indisponivel</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Text style={styles.errorAction}>Toque para tentar novamente</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{vehiclesCount}</Text>
              <Text style={styles.statLabel}>Veiculos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{maintenancesCount}</Text>
              <Text style={styles.statLabel}>Servicos</Text>
            </View>
          </View>
        )}

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('vehicles')}>
            <Text style={styles.menuButtonText}>
              {currentArea === 'mechanic' ? 'Clientes e Veiculos' : 'Meus Veiculos'}
            </Text>
            <Text style={styles.menuButtonSubtext}>
              {currentArea === 'mechanic' ? 'Cadastre carros atendidos pela oficina' : 'Cadastre seus veiculos pessoais'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => onNavigate('maintenance')}>
            <Text style={styles.menuButtonText}>
              {currentArea === 'mechanic' ? 'Servicos da Oficina' : 'Meu Historico'}
            </Text>
            <Text style={styles.menuButtonSubtext}>Salve servicos, datas e quilometragem</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </View>
);

const VehiclesScreen = ({ area, vehicles, onNavigate, onReload }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [saving, setSaving] = useState(false);

  const availableModels = useMemo(() => MODELS[selectedBrand] || [], [selectedBrand]);

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
          {BRANDS.map((brand) => (
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
        <Input label="Proxima revisao em km" value={nextServiceAt} onChangeText={setNextServiceAt} placeholder="Ex: 5000" keyboardType="numeric" />
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
              {item.nextServiceAt ? <Text style={styles.cardInfo}>Proxima em: {item.nextServiceAt.toLocaleString('pt-BR')} km</Text> : null}
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
    backgroundColor: '#0B1120',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1120',
  },
  loadingText: {
    color: '#f5f5f7',
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    marginTop: 16,
  },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1120',
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
    backgroundColor: '#111827',
    borderColor: '#243044',
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
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  areaButton: {
    backgroundColor: '#111827',
    padding: 22,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E83E8C',
    shadowColor: '#E83E8C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 5,
  },
  areaButtonSecondary: {
    backgroundColor: '#0F172A',
    padding: 22,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#38BDF8',
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
    color: '#F472B6',
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
    backgroundColor: '#1E1322',
    borderColor: '#7B2D56',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorTitle: {
    color: '#ffb4d3',
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
    color: '#F472B6',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0B1120',
    borderBottomColor: '#1E293B',
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#F472B6',
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
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionButtonSelected: {
    backgroundColor: '#E83E8C',
    borderColor: '#F472B6',
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
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  smallOptionButtonSelected: {
    backgroundColor: '#E83E8C',
    borderColor: '#F472B6',
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
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: '#E83E8C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#E83E8C',
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
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#243044',
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
  deleteButton: {
    alignSelf: 'flex-start',
    borderColor: '#7B2D56',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#FDA4CF',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyState: {
    backgroundColor: '#111827',
    borderColor: '#243044',
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
    backgroundColor: '#1E1322',
    borderColor: '#7B2D56',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  warningText: {
    color: '#FBCFE8',
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    lineHeight: 21,
  },
});

