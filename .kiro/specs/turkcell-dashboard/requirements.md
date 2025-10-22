# Requirements Document

## Introduction

Turkcell Dashboard özelliği, HesapOnda uygulamasının ana dashboard'unda Turkcell günlük işlem sayısını ve aylık hedef durumunu gösteren iki KPI kartı ekleyecektir. Bu özellik, kullanıcıların Turkcell işlemlerini takip etmelerini ve hedeflerine ulaşma durumlarını görsel olarak izlemelerini sağlayacaktır.

## Glossary

- **Dashboard_System**: Ana dashboard sayfasını yöneten sistem bileşeni
- **Turkcell_Store**: Turkcell işlem verilerini yöneten Zustand store
- **KPI_Card**: Anahtar performans göstergelerini görsel olarak sunan UI bileşeni
- **Daily_Transaction**: Günlük gerçekleştirilen Turkcell işlem sayısı
- **Monthly_Target**: Aylık hedeflenen toplam Turkcell işlem sayısı
- **Progress_Indicator**: Hedef durumunu görsel olarak gösteren progress bar bileşeni
- **Sidebar_Navigation**: Ana navigasyon menüsünü yöneten sidebar bileşeni
- **Operator_Operations**: Operatör işlemlerini yöneten sayfa bileşeni
- **Target_Settings**: Aylık hedef ayarlarını yöneten form bileşeni

## Requirements

### Requirement 1

**User Story:** Kullanıcı olarak, günlük Turkcell işlem sayımı görebilmek istiyorum, böylece günlük performansımı takip edebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı ana dashboard'u açtığında, THE Dashboard_System SHALL günlük Turkcell işlem sayısını gösteren KPI kartını görüntüler
2. THE KPI_Card SHALL güncel günlük işlem sayısını büyük font ile merkezi konumda gösterir
3. THE KPI_Card SHALL "Bugün gerçekleştirilen toplam işlem sayısı" açıklama metnini içerir
4. THE KPI_Card SHALL smartphone ikonu ile görsel kimlik sağlar
5. WHEN günlük veri güncellendiğinde, THE Dashboard_System SHALL KPI kartındaki sayıyı otomatik olarak yeniler

### Requirement 2

**User Story:** Kullanıcı olarak, aylık hedef durumumu görebilmek istiyorum, böylece hedefime ne kadar yaklaştığımı bilebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı ana dashboard'u açtığında, THE Dashboard_System SHALL aylık hedef durumunu gösteren progress kartını görüntüler
2. THE Progress_Indicator SHALL gerçekleşme oranını yüzde olarak gösterir
3. THE Progress_Indicator SHALL hedef sayısını "Hedef: X işlem" formatında gösterir
4. THE Progress_Indicator SHALL görsel progress bar ile ilerleme durumunu gösterir
5. THE Progress_Indicator SHALL target ikonu ile görsel kimlik sağlar

### Requirement 3

**User Story:** Sistem yöneticisi olarak, Turkcell işlem verilerinin doğru şekilde saklanmasını istiyorum, böylece raporlama güvenilir olsun.

#### Acceptance Criteria

1. THE Turkcell_Store SHALL günlük işlem verilerini Supabase turkcell_transactions tablosunda saklar
2. THE Turkcell_Store SHALL aylık hedef verilerini Supabase turkcell_targets tablosunda saklar
3. WHEN yeni işlem kaydedildiğinde, THE Turkcell_Store SHALL veritabanını günceller
4. THE Turkcell_Store SHALL veri bütünlüğünü korumak için user_id ile işlemleri ilişkilendirir
5. THE Turkcell_Store SHALL hatalı veri durumunda fallback değer olarak 0 gösterir

### Requirement 4

**User Story:** Kullanıcı olarak, dashboard'un hızlı yüklenmesini istiyorum, böylece verimli çalışabilirim.

#### Acceptance Criteria

1. WHEN dashboard yüklendiğinde, THE Dashboard_System SHALL Turkcell verilerini paralel olarak getirir
2. THE Dashboard_System SHALL veri yüklenirken loading durumunu gösterir
3. THE Dashboard_System SHALL 2 saniye içinde KPI kartlarını görüntüler
4. THE Dashboard_System SHALL veri getirme hatalarını kullanıcı dostu mesajlarla yönetir
5. THE Dashboard_System SHALL responsive tasarım ile farklı ekran boyutlarında düzgün görüntüler

### Requirement 5

**User Story:** Kullanıcı olarak, KPI kartlarının görsel olarak tutarlı olmasını istiyorum, böylece profesyonel bir arayüz deneyimi yaşayabilirim.

#### Acceptance Criteria

1. THE KPI_Card SHALL mevcut tasarım sisteminin renk paletini kullanır
2. THE KPI_Card SHALL 16px padding ve 12px border radius ile tutarlı stil uygular
3. THE KPI_Card SHALL Inter font ailesi ile tipografi tutarlılığı sağlar
4. THE KPI_Card SHALL subtle shadow efekti ile derinlik hissi verir
5. THE KPI_Card SHALL 4 kolonluk grid sisteminde 2 kolon genişliğinde yerleşir

### Requirement 6

**User Story:** Kullanıcı olarak, operatör işlemlerine kolay erişebilmek istiyorum, böylece hedef ayarları ve diğer işlemleri hızlıca yapabilirim.

#### Acceptance Criteria

1. THE Sidebar_Navigation SHALL "Operatör İşlemleri" menü öğesini içerir
2. WHEN kullanıcı "Operatör İşlemleri" butonuna tıkladığında, THE Sidebar_Navigation SHALL operatör işlemleri sayfasına yönlendirir
3. THE Operator_Operations SHALL hedef ayarları formunu içerir
4. THE Operator_Operations SHALL diğer operatör işlemlerini listeleme özelliği sağlar
5. THE Sidebar_Navigation SHALL aktif sayfa durumunu görsel olarak belirtir

### Requirement 7

**User Story:** Operatör olarak, aylık hedeflerimi ayarlayabilmek istiyorum, böylece performans takibimi kişiselleştirebilirim.

#### Acceptance Criteria

1. THE Target_Settings SHALL mevcut aylık hedefi görüntüler
2. THE Target_Settings SHALL yeni hedef değeri girme imkanı sağlar
3. WHEN hedef kaydedildiğinde, THE Target_Settings SHALL Supabase turkcell_targets tablosunu günceller
4. THE Target_Settings SHALL form validasyonu ile geçersiz değerleri engeller
5. THE Target_Settings SHALL başarılı kayıt sonrası onay mesajı gösterir