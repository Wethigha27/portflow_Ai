"""
Django management command to generate test data for the admin dashboard.
Usage: python manage.py generate_test_data
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
    help = 'Generate test data for admin dashboard (ports, ships, users, weather, notifications, blockchain)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--ports',
            type=int,
            default=15,
            help='Number of ports to create (default: 15)'
        )
        parser.add_argument(
            '--ships',
            type=int,
            default=50,
            help='Number of ships to create (default: 50)'
        )
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create (default: 20)'
        )
        parser.add_argument(
            '--messages',
            type=int,
            default=25,
            help='Number of messages to create (default: 25)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting data generation...'))
        
        # 1. Create Ports
        ports_created = self.create_ports(options['ports'])
        self.stdout.write(self.style.SUCCESS(f'✅ Created {ports_created} ports'))
        
        # 2. Create Ships
        ports = Port.objects.all()
        ships_created = self.create_ships(options['ships'], ports)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {ships_created} ships'))
        
        # 3. Create Users
        users_created = self.create_users(options['users'])
        self.stdout.write(self.style.SUCCESS(f'✅ Created {users_created} users'))
        
        # 4. Create Weather Data
        weather_created = self.create_weather_data(ports)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {weather_created} weather records'))
        
        # 5. Create Weather Alerts
        alerts_created = self.create_weather_alerts(ports)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {alerts_created} weather alerts'))
        
        # 6. Create Notifications
        users = User.objects.all()
        ships = Ship.objects.all()
        notifs_created = self.create_notifications(users, ships)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {notifs_created} notifications'))
        
        # 7. Create Messages
        messages_created = self.create_messages(users, ships, options['messages'])
        self.stdout.write(self.style.SUCCESS(f'✅ Created {messages_created} messages'))
        
        # 8. Create Blockchain Predictions
        preds_created = self.create_predictions(ships)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {preds_created} blockchain predictions'))
        
        # 9. Create Point Activities
        activities_created = self.create_point_activities(users)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {activities_created} point activities'))
        
        self.stdout.write(self.style.SUCCESS('✨ Data generation completed!'))

    def create_ports(self, count):
        """Create test ports"""
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
        
        created = 0
        for i, data in enumerate(port_data[:count]):
            port, created_flag = Port.objects.get_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'country': data['country'],
                    'city': data['city'],
                    'latitude': data['lat'],
                    'longitude': data['lon'],
                }
            )
            if created_flag:
                created += 1
        return created

    def create_ships(self, count, ports):
        """Create test ships"""
        ship_names = [
            'Ever Given', 'MSC Oscar', 'CMA CGM Marco Polo', 'OOCL Hong Kong',
            'COSCO Shipping Universe', 'Madrid Maersk', 'MOL Triumph', 'Barzan',
            'MSC Gülsün', 'CMA CGM Antoine de Saint Exupéry', 'HMM Algeciras',
            'CMA CGM J. Adams', 'MSC Zoe', 'MSC Arina', 'CMA CGM Vasco de Gama',
            'OOCL Germany', 'MSC Istanbul', 'CMA CGM Benjamin Franklin',
            'COSCO Shipping Taurus', 'MOL Creation', 'APL Singapore', 'Evergreen A-type',
            'Hamburg Süd Cap San Marco', 'MSC Barcelona', 'CMA CGM Kerguelen',
            'Maersk Mc-Kinney Møller', 'COSCO Shipping Andromeda', 'MOL Truth',
            'CMA CGM Alexander von Humboldt', 'MSC Beatrice', 'CMA CGM Mozart',
            'OOCL Beijing', 'HMM Gdansk', 'MSC Leni', 'COSCO Shipping Gemini',
            'CMA CGM Jules Verne', 'MOL Tribute', 'APL Yangshan', 'MSC Eloane',
            'CMA CGM Theodore Roosevelt', 'Evergreen G-type', 'MOL Trust',
            'Hamburg Süd Cap San Lucas', 'MSC Geneva', 'CMA CGM Bougainville',
            'COSCO Shipping Aries', 'MOL Tradition', 'APL Vanda', 'MSC Ambra',
            'CMA CGM George Washington'
        ]
        
        ship_types = ['container', 'tanker', 'cargo', 'passenger', 'fishing', 'other']
        statuses = ['Underway', 'At Anchor', 'Moored', 'Not Under Command']
        
        created = 0
        for i in range(count):
            imo = f'{random.randint(9000000, 9999999)}'
            name = random.choice(ship_names) + f' {random.randint(1, 99)}'
            ship_type = random.choice(ship_types)
            
            # Random position
            lat = random.uniform(35.0, 55.0)
            lon = random.uniform(-10.0, 15.0)
            
            ship, created_flag = Ship.objects.get_or_create(
                imo_number=imo,
                defaults={
                    'name': name,
                    'type': ship_type,
                    'current_latitude': lat,
                    'current_longitude': lon,
                    'current_speed': random.uniform(0, 25),
                    'current_heading': random.uniform(0, 360),
                    'status': random.choice(statuses),
                    'destination_port': random.choice(ports) if ports.exists() else None,
                    'expected_arrival': timezone.now() + timedelta(days=random.randint(1, 30)),
                    'length': random.uniform(100, 400),
                    'width': random.uniform(20, 60),
                    'draft': random.uniform(5, 20),
                }
            )
            if created_flag:
                # Assign some users to track
                users = User.objects.all()[:random.randint(0, 5)]
                ship.tracked_by.set(users)
                created += 1
        
        return created

    def create_users(self, count):
        """Create test users"""
        created = 0
        for i in range(count):
            username = f'merchant_{i+1}'
            email = f'merchant{i+1}@example.com'
            
            user, created_flag = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'user_type': 'merchant' if i % 3 != 0 else 'admin',
                    'phone_number': f'+33{random.randint(100000000, 999999999)}',
                    'company_name': f'Company {i+1}',
                    'points': random.randint(0, 1000),
                    'email_verified': True,
                }
            )
            if created_flag:
                user.set_password('password123')
                user.save()
                
                # Create UserScore
                UserScore.objects.get_or_create(
                    user=user,
                    defaults={
                        'total_points': user.points,
                        'level': self._get_level(user.points)
                    }
                )
                created += 1
        return created

    def _get_level(self, points):
        if points >= 1000:
            return 'Expert'
        elif points >= 500:
            return 'Avancé'
        elif points >= 100:
            return 'Intermédiaire'
        return 'Débutant'

    def create_weather_data(self, ports):
        """Create weather data for ports"""
        created = 0
        for port in ports:
            weather, created_flag = WeatherData.objects.get_or_create(
                port=port,
                defaults={
                    'temperature': random.uniform(5, 30),
                    'humidity': random.randint(40, 90),
                    'wind_speed': random.uniform(5, 40),
                    'wind_direction': random.randint(0, 360),
                    'weather_condition': random.choice(['Clear', 'Clouds', 'Rain', 'Fog', 'Wind']),
                    'description': random.choice([
                        'Clear sky', 'Partly cloudy', 'Light rain', 'Heavy rain',
                        'Foggy conditions', 'Strong winds', 'Moderate winds'
                    ]),
                    'visibility': random.randint(1000, 10000),
                }
            )
            if created_flag:
                created += 1
        return created

    def create_weather_alerts(self, ports):
        """Create weather alerts"""
        alert_types = ['storm', 'high_wind', 'fog', 'heavy_rain', 'heat_wave']
        severities = ['low', 'medium', 'high']
        
        created = 0
        for port in ports[:5]:  # Alerts for first 5 ports
            alert, created_flag = WeatherAlert.objects.get_or_create(
                port=port,
                alert_type=random.choice(alert_types),
                defaults={
                    'severity': random.choice(severities),
                    'message': f'Alert for {port.name}: {random.choice(alert_types)} warning',
                    'start_time': timezone.now(),
                    'end_time': timezone.now() + timedelta(days=random.randint(1, 3)),
                    'is_active': random.choice([True, False]),
                }
            )
            if created_flag:
                created += 1
        return created

    def create_notifications(self, users, ships):
        """Create notifications"""
        notif_types = ['delay', 'weather', 'position', 'arrival', 'departure', 'eta_change', 'system']
        severities = ['low', 'medium', 'high', 'critical']
        
        created = 0
        for user in users[:15]:
            for _ in range(random.randint(2, 8)):
                notif = Notification.objects.create(
                    user=user,
                    title=random.choice([
                        'Ship delay notification', 'Weather alert', 'Position update',
                        'Ship arrival', 'Ship departure', 'ETA changed', 'System notification'
                    ]),
                    message=f'This is a {random.choice(notif_types)} notification',
                    notification_type=random.choice(notif_types),
                    severity=random.choice(severities),
                    is_read=random.choice([True, False]),
                    is_actionable=random.choice([True, False]),
                    related_ship=random.choice(ships) if ships.exists() else None,
                    created_at=timezone.now() - timedelta(hours=random.randint(0, 168)),
                )
                created += 1
        return created

    def create_messages(self, users, ships, count=25):
        """Create messages between users"""
        message_types = ['inquiry', 'support', 'alert', 'general']
        
        created = 0
        for i in range(count):
            from_user = random.choice(users)
            to_user = random.choice(users.exclude(id=from_user.id))
            
            message = Message.objects.create(
                from_user=from_user,
                to_user=to_user,
                subject=random.choice([
                    'Question about shipment', 'Support request', 'Alert notification',
                    'General inquiry', 'Port information request'
                ]),
                content=f'This is a message from {from_user.username} to {to_user.username}',
                message_type=random.choice(message_types),
                is_read=random.choice([True, False]),
                is_urgent=random.choice([True, False]),
                related_ship=random.choice(ships) if ships.exists() else None,
                created_at=timezone.now() - timedelta(hours=random.randint(0, 168)),
            )
            created += 1
        return created

    def create_predictions(self, ships):
        """Create blockchain predictions"""
        created = 0
        for ship in ships[:30]:
            pred = Prediction.objects.create(
                ship_name=ship.name,
                lat=ship.current_latitude or random.uniform(35.0, 55.0),
                lon=ship.current_longitude or random.uniform(-10.0, 15.0),
                risk_score=random.uniform(0.1, 0.95),
                hcs_status=random.choice(['success', 'pending', 'failed']),
                hcs_tx_id=f'0.{random.randint(100000, 999999)}.{random.randint(100000, 999999)}',
                created_at=timezone.now() - timedelta(hours=random.randint(0, 168)),
            )
            created += 1
        return created

    def create_point_activities(self, users):
        """Create point activities"""
        activity_types = [
            'prediction_created', 'daily_login', 'ship_tracked', 'port_visited',
            'weather_checked', 'message_sent', 'notification_read'
        ]
        
        created = 0
        for user in users:
            for _ in range(random.randint(5, 20)):
                activity = PointActivity.objects.create(
                    user=user,
                    activity_type=random.choice(activity_types),
                    points=random.randint(1, 50),
                    hcs_status=random.choice(['success', 'pending', None]),
                    hcs_tx_id=f'0.{random.randint(100000, 999999)}.{random.randint(100000, 999999)}' if random.choice([True, False]) else None,
                    timestamp=timezone.now() - timedelta(hours=random.randint(0, 720)),
                )
                created += 1
        return created

