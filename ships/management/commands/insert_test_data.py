"""
Script pour insérer exactement les données demandées :
- 15 utilisateurs
- 17 navires
- 10 ports
- 25 messages
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from ships.models import Port, Ship
from weather.models import WeatherData, WeatherAlert
from notifications.models import Notification, Message
from blockchain.models import Prediction, PointActivity, UserScore

User = get_user_model()


class Command(BaseCommand):
    help = 'Insert exact test data: 15 users, 17 ships, 10 ports, 25 messages'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting data insertion...'))
        
        # Clear existing test data first
        self.stdout.write(self.style.WARNING('🗑️  Clearing existing test data...'))
        Message.objects.all().delete()
        Notification.objects.all().delete()
        Prediction.objects.all().delete()
        PointActivity.objects.all().delete()
        UserScore.objects.all().delete()
        Ship.objects.all().delete()
        WeatherData.objects.all().delete()
        WeatherAlert.objects.all().delete()
        Port.objects.all().delete()
        User.objects.filter(username__startswith='user_').delete()
        self.stdout.write(self.style.SUCCESS('✅ Cleared existing data'))
        
        # 1. Create exactly 10 ports
        ports = self.create_ports(10)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(ports)} ports'))
        
        # 2. Create exactly 15 users
        users = self.create_users(15)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(users)} users'))
        
        # 3. Create exactly 17 ships
        ships = self.create_ships(17, ports)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(ships)} ships'))
        
        # 4. Create exactly 25 messages
        messages = self.create_messages(25, users, ships)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(messages)} messages'))
        
        # 5. Create weather data for ports
        weather_count = self.create_weather_data(ports)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {weather_count} weather records'))
        
        # 6. Create some notifications
        notifs_count = self.create_notifications(users, ships)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {notifs_count} notifications'))
        
        # 7. Create some predictions
        preds_count = self.create_predictions(ships)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {preds_count} predictions'))
        
        self.stdout.write(self.style.SUCCESS('✨ Data insertion completed!'))

    def create_ports(self, count):
        """Create exactly N ports"""
        port_data = [
            {'name': 'Port de Marseille', 'country': 'France', 'city': 'Marseille', 'code': 'FRMRS', 'lat': 43.2965, 'lon': 5.3698},
            {'name': 'Port de Rotterdam', 'country': 'Netherlands', 'city': 'Rotterdam', 'code': 'NLRTM', 'lat': 51.9225, 'lon': 4.4781},
            {'name': 'Port de Hambourg', 'country': 'Germany', 'city': 'Hamburg', 'code': 'DEHAM', 'lat': 53.5511, 'lon': 9.9937},
            {'name': 'Port d\'Anvers', 'country': 'Belgium', 'city': 'Antwerp', 'code': 'BEANR', 'lat': 51.2194, 'lon': 4.4025},
            {'name': 'Port de Barcelone', 'country': 'Spain', 'city': 'Barcelona', 'code': 'ESBCN', 'lat': 41.3851, 'lon': 2.1734},
            {'name': 'Port de Gênes', 'country': 'Italy', 'city': 'Genoa', 'code': 'ITGOA', 'lat': 44.4056, 'lon': 8.9463},
            {'name': 'Port du Havre', 'country': 'France', 'city': 'Le Havre', 'code': 'FRLEH', 'lat': 49.4944, 'lon': 0.1079},
            {'name': 'Port de Londres', 'country': 'UK', 'city': 'London', 'code': 'GBLON', 'lat': 51.5074, 'lon': -0.1278},
            {'name': 'Port de Southampton', 'country': 'UK', 'city': 'Southampton', 'code': 'GBSOU', 'lat': 50.9097, 'lon': -1.4044},
            {'name': 'Port de Tanger', 'country': 'Morocco', 'city': 'Tangier', 'code': 'MATNG', 'lat': 35.7595, 'lon': -5.8340},
            {'name': 'Port de Casablanca', 'country': 'Morocco', 'city': 'Casablanca', 'code': 'MACAS', 'lat': 33.5731, 'lon': -7.5898},
            {'name': 'Port de Tanger-Med', 'country': 'Morocco', 'city': 'Tangier', 'code': 'MATGM', 'lat': 35.8967, 'lon': -5.5127},
            {'name': 'Port de Valence', 'country': 'Spain', 'city': 'Valencia', 'code': 'ESVLC', 'lat': 39.4699, 'lon': -0.3763},
            {'name': 'Port de Lisbonne', 'country': 'Portugal', 'city': 'Lisbon', 'code': 'PTLIS', 'lat': 38.7223, 'lon': -9.1393},
            {'name': 'Port d\'Athènes', 'country': 'Greece', 'city': 'Athens', 'code': 'GRPIR', 'lat': 37.9838, 'lon': 23.7275},
        ]
        
        created_ports = []
        for i, data in enumerate(port_data[:count]):
            # Make codes unique by adding timestamp
            unique_code = f"{data['code']}{i}_{random.randint(100, 999)}"
            port = Port.objects.create(
                name=f"{data['name']} {i+1}" if i > 0 else data['name'],
                country=data['country'],
                city=data['city'],
                code=unique_code,
                latitude=data['lat'] + (random.uniform(-0.1, 0.1) if i > 0 else 0),
                longitude=data['lon'] + (random.uniform(-0.1, 0.1) if i > 0 else 0),
            )
            created_ports.append(port)
        return created_ports

    def create_users(self, count):
        """Create exactly N users"""
        created_users = []
        for i in range(count):
            username = f'user_{i+1}_{random.randint(1000, 9999)}'
            email = f'user{i+1}@portflow.com'
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password='password123',
                user_type='merchant' if i % 3 != 0 else 'admin',
                phone_number=f'+33{random.randint(100000000, 999999999)}',
                company_name=f'Company {i+1}',
                points=random.randint(0, 1000),
                email_verified=True,
            )
            
            # Create UserScore
            UserScore.objects.get_or_create(
                user=user,
                defaults={
                    'total_points': user.points,
                    'level': self._get_level(user.points)
                }
            )
            created_users.append(user)
        return created_users

    def _get_level(self, points):
        if points >= 1000:
            return 'Expert'
        elif points >= 500:
            return 'Avancé'
        elif points >= 100:
            return 'Intermédiaire'
        return 'Débutant'

    def create_ships(self, count, ports):
        """Create exactly N ships"""
        ship_names = [
            'Ever Given', 'MSC Oscar', 'CMA CGM Marco Polo', 'OOCL Hong Kong',
            'COSCO Shipping Universe', 'Madrid Maersk', 'MOL Triumph', 'Barzan',
            'MSC Gülsün', 'CMA CGM Antoine de Saint Exupéry', 'HMM Algeciras',
            'CMA CGM J. Adams', 'MSC Zoe', 'MSC Arina', 'CMA CGM Vasco de Gama',
            'OOCL Germany', 'MSC Istanbul', 'CMA CGM Benjamin Franklin',
        ]
        
        ship_types = ['container', 'tanker', 'cargo', 'passenger', 'fishing', 'other']
        statuses = ['Underway', 'At Anchor', 'Moored', 'Not Under Command']
        
        created_ships = []
        for i in range(count):
            imo = f'{random.randint(9000000, 9999999)}'
            name = ship_names[i] if i < len(ship_names) else f'Ship_{i+1}'
            ship_type = random.choice(ship_types)
            
            lat = random.uniform(35.0, 55.0)
            lon = random.uniform(-10.0, 15.0)
            
            ship = Ship.objects.create(
                name=name,
                imo_number=imo,
                type=ship_type,
                current_latitude=lat,
                current_longitude=lon,
                current_speed=random.uniform(0, 25),
                current_heading=random.uniform(0, 360),
                status=random.choice(statuses),
                destination_port=random.choice(ports) if ports else None,
                expected_arrival=timezone.now() + timedelta(days=random.randint(1, 30)),
                length=random.uniform(100, 400),
                width=random.uniform(20, 60),
                draft=random.uniform(5, 20),
            )
            
            # Assign some users to track
            if User.objects.exists():
                users_to_track = User.objects.all()[:random.randint(1, 3)]
                ship.tracked_by.set(users_to_track)
            
            created_ships.append(ship)
        return created_ships

    def create_messages(self, count, users, ships):
        """Create exactly N messages"""
        message_types = ['inquiry', 'support', 'alert', 'general']
        subjects = [
            'Question about shipment delay',
            'Support request',
            'Alert notification',
            'General inquiry',
            'Port information request',
            'Weather update needed',
            'Ship tracking issue',
            'Account assistance',
        ]
        
        created_messages = []
        if len(users) < 2:
            self.stdout.write(self.style.WARNING('⚠️  Need at least 2 users to create messages'))
            return created_messages
        
        for i in range(count):
            from_user = random.choice(users)
            other_users = [u for u in users if u.id != from_user.id]
            if not other_users:
                self.stdout.write(self.style.WARNING(f'⚠️  Skipping message {i+1}: need at least 2 users'))
                continue
            to_user = random.choice(other_users)
            
            message = Message.objects.create(
                from_user=from_user,
                to_user=to_user,
                subject=random.choice(subjects),
                content=f'Message #{i+1}: This is a message from {from_user.username} to {to_user.username} regarding {random.choice(subjects)}.',
                message_type=random.choice(message_types),
                is_read=random.choice([True, False]),
                is_urgent=random.choice([True, False]),
                related_ship=random.choice(ships) if ships else None,
                created_at=timezone.now() - timedelta(hours=random.randint(0, 168)),
            )
            created_messages.append(message)
        return created_messages

    def create_weather_data(self, ports):
        """Create weather data for ports"""
        created = 0
        for port in ports:
            WeatherData.objects.create(
                port=port,
                temperature=random.uniform(5, 30),
                humidity=random.randint(40, 90),
                wind_speed=random.uniform(5, 40),
                wind_direction=random.randint(0, 360),
                weather_condition=random.choice(['Clear', 'Clouds', 'Rain', 'Fog', 'Wind']),
                description=random.choice([
                    'Clear sky', 'Partly cloudy', 'Light rain', 'Heavy rain',
                    'Foggy conditions', 'Strong winds', 'Moderate winds'
                ]),
                visibility=random.randint(1000, 10000),
            )
            created += 1
        return created

    def create_notifications(self, users, ships):
        """Create notifications"""
        notif_types = ['delay', 'weather', 'position', 'arrival', 'departure', 'eta_change', 'system']
        severities = ['low', 'medium', 'high', 'critical']
        
        created = 0
        for user in users[:10]:
            for _ in range(random.randint(2, 5)):
                Notification.objects.create(
                    user=user,
                    title=random.choice([
                        'Ship delay notification', 'Weather alert', 'Position update',
                        'Ship arrival', 'Ship departure', 'ETA changed', 'System notification'
                    ]),
                    message=f'Notification for {user.username}',
                    notification_type=random.choice(notif_types),
                    severity=random.choice(severities),
                    is_read=random.choice([True, False]),
                    is_actionable=random.choice([True, False]),
                    related_ship=random.choice(ships) if ships else None,
                    created_at=timezone.now() - timedelta(hours=random.randint(0, 168)),
                )
                created += 1
        return created

    def create_predictions(self, ships):
        """Create blockchain predictions"""
        created = 0
        try:
            for ship in ships[:10]:
                Prediction.objects.create(
                    ship_name=ship.name,
                    lat=ship.current_latitude or random.uniform(35.0, 55.0),
                    lon=ship.current_longitude or random.uniform(-10.0, 15.0),
                    risk_score=random.uniform(0.1, 0.95),
                    hcs_status=random.choice(['success', 'pending', 'failed']),
                    hcs_tx_id=f'0.{random.randint(100000, 999999)}.{random.randint(100000, 999999)}',
                    created_at=timezone.now() - timedelta(hours=random.randint(0, 168)),
                )
                created += 1
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  Could not create predictions: {e}'))
        return created

