#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
QuickServe Backend - Flask API
Merit Royal Diamond Otel
"""

import os
import json
import base64
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db, messaging
from dotenv import load_dotenv

# Environment variables yükle
load_dotenv()

# Flask App
app = Flask(__name__)

# CORS ayarları
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=allowed_origins, supports_credentials=True)

# Firebase Admin SDK Initialize
try:
    service_account_base64 = os.getenv('FIREBASE_SERVICE_ACCOUNT_BASE64')

    if not service_account_base64:
        raise ValueError('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable bulunamadı!')

    # Base64'ten decode et
    service_account_json = base64.b64decode(service_account_base64).decode('utf-8')
    service_account = json.loads(service_account_json)

    # Firebase initialize
    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred, {
        'databaseURL': f"https://{os.getenv('FIREBASE_PROJECT_ID', 'shuttle-call-835d9')}-default-rtdb.firebaseio.com"
    })

    print('✅ Firebase Admin initialized')
except Exception as e:
    print(f'❌ Firebase initialization error: {e}')
    raise

# Helper Functions
def get_timestamp():
    """Şu anki timestamp'i döndür"""
    return int(datetime.now().timestamp() * 1000)

def update_statistics(salon):
    """Günlük istatistikleri güncelle"""
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        stats_ref = db.reference(f'statistics/{today}')

        current = stats_ref.get() or {}

        total = current.get('totalRequests', 0) + 1
        salons = current.get('salons', {})
        salons[salon] = salons.get(salon, 0) + 1

        stats_ref.set({
            'totalRequests': total,
            'salons': salons,
            'lastUpdated': get_timestamp()
        })

        print(f'📊 İstatistikler güncellendi: {salon}')
    except Exception as e:
        print(f'❌ Statistics error: {e}')

# Routes
@app.route('/')
def index():
    """API bilgileri"""
    return jsonify({
        'message': 'QuickServe Backend API',
        'version': '1.0.0',
        'endpoints': {
            'health': 'GET /health',
            'send_notification': 'POST /api/send-notification',
            'subscribe': 'POST /api/subscribe',
            'unsubscribe': 'POST /api/unsubscribe',
            'statistics': 'GET /api/statistics'
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': get_timestamp(),
        'service': 'QuickServe Backend',
        'version': '1.0.0',
        'firebase': 'connected'
    })

@app.route('/api/send-notification', methods=['POST'])
def send_notification():
    """Bildirim gönder"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': 'JSON data gerekli'}), 400

        salon = data.get('salon')
        timestamp = data.get('timestamp', get_timestamp())
        req_type = data.get('type', 'service-request')

        # Validation
        if not salon:
            return jsonify({'success': False, 'error': 'Salon parametresi gerekli'}), 400

        valid_salons = ['Barnabas', 'Zefiros', 'Kourion', 'Karmi']
        if salon not in valid_salons:
            return jsonify({
                'success': False,
                'error': f'Geçersiz salon. Geçerli salonlar: {", ".join(valid_salons)}'
            }), 400

        # Realtime Database'e kaydet
        request_ref = db.reference('service-requests').push({
            'salon': salon,
            'timestamp': timestamp,
            'type': req_type,
            'createdAt': get_timestamp()
        })

        request_id = request_ref.key
        print(f'📨 Yeni servis talebi: {salon} ({request_id})')

        # FCM Bildirim Gönder
        message = messaging.Message(
            notification=messaging.Notification(
                title='Servis Talebi',
                body=f'{salon} salonundan servis talebi'
            ),
            data={
                'salon': salon,
                'timestamp': str(timestamp),
                'type': req_type,
                'requestId': request_id
            },
            topic='service-requests',
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    icon='/assets/logo.png',
                    badge='/assets/logo.png',
                    require_interaction=True,
                    vibrate=[200, 100, 200, 100, 200]
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link='/staff/'
                )
            ),
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    sound='default',
                    channel_id='service-requests'
                )
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound='default',
                        badge=1
                    )
                )
            )
        )

        message_id = messaging.send(message)
        print(f'✅ Bildirim gönderildi: {message_id}')

        # Notification kaydı
        db.reference(f'notifications/{request_id}').set({
            'salon': salon,
            'timestamp': timestamp,
            'sentAt': get_timestamp(),
            'messageId': message_id,
            'status': 'sent'
        })

        # İstatistik güncelle
        update_statistics(salon)

        return jsonify({
            'success': True,
            'requestId': request_id,
            'messageId': message_id,
            'salon': salon,
            'timestamp': timestamp
        })

    except Exception as e:
        print(f'❌ Send notification error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """FCM topic subscription"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': 'JSON data gerekli'}), 400

        token = data.get('token')
        topic = data.get('topic', 'service-requests')

        if not token:
            return jsonify({'success': False, 'error': 'Token parametresi gerekli'}), 400

        # FCM topic subscription
        response = messaging.subscribe_to_topic([token], topic)
        print(f'✅ Token topic\'e subscribe oldu: {topic}')

        # Database'e kaydet
        subscription_ref = db.reference('subscriptions').push({
            'token': token,
            'topic': topic,
            'timestamp': get_timestamp(),
            'subscribedAt': get_timestamp(),
            'status': 'active'
        })

        return jsonify({
            'success': True,
            'topic': topic,
            'subscriptionId': subscription_ref.key,
            'successCount': response.success_count,
            'failureCount': response.failure_count
        })

    except Exception as e:
        print(f'❌ Subscribe error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/unsubscribe', methods=['POST'])
def unsubscribe():
    """FCM topic unsubscription"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': 'JSON data gerekli'}), 400

        token = data.get('token')
        topic = data.get('topic', 'service-requests')

        if not token:
            return jsonify({'success': False, 'error': 'Token parametresi gerekli'}), 400

        response = messaging.unsubscribe_from_topic([token], topic)
        print(f'✅ Token topic\'ten unsubscribe oldu: {topic}')

        return jsonify({
            'success': True,
            'topic': topic,
            'successCount': response.success_count,
            'failureCount': response.failure_count
        })

    except Exception as e:
        print(f'❌ Unsubscribe error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/statistics')
def statistics():
    """İstatistikleri getir"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))

        stats_ref = db.reference(f'statistics/{date}')
        stats = stats_ref.get()

        if not stats:
            return jsonify({
                'success': True,
                'date': date,
                'totalRequests': 0,
                'salons': {}
            })

        return jsonify({
            'success': True,
            'date': date,
            **stats
        })

    except Exception as e:
        print(f'❌ Statistics error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

# Error Handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'success': False, 'error': 'Endpoint bulunamadı'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'success': False, 'error': 'Sunucu hatası'}), 500

# Ana çalıştırma
if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    debug = os.getenv('FLASK_ENV') == 'development'

    print('')
    print('=' * 40)
    print('🚀 QuickServe Backend Server (Flask)')
    print('=' * 40)
    print(f'📡 Server: http://0.0.0.0:{port}')
    print(f'🌍 Environment: {os.getenv("FLASK_ENV", "production")}')
    print(f'🔥 Firebase Project: {os.getenv("FIREBASE_PROJECT_ID", "shuttle-call-835d9")}')
    print('=' * 40)
    print('')

    app.run(host='0.0.0.0', port=port, debug=debug)
