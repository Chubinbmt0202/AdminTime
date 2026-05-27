import { BrowserRouter } from 'react-router-dom';
import { ToastProvider, useToast } from './components/common/Toast/Toast';
import AppRoutes from './routes';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { useEffect, useRef } from 'react';
import { database } from './config/firebase';
import { ref, onChildAdded } from 'firebase/database';

// Hàm phát tiếng kêu thông báo nhẹ nhàng, hiện đại bằng Web Audio API (không cần tải file âm thanh)
const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    const now = audioCtx.currentTime;
    
    // Âm nốt 1: E5 (659.25 Hz)
    oscillator.frequency.setValueAtTime(659.25, now);
    gainNode.gain.setValueAtTime(0.08, now);
    
    // Âm nốt 2: A5 (880 Hz)
    oscillator.frequency.setValueAtTime(880, now + 0.12);
    gainNode.gain.setValueAtTime(0.08, now + 0.12);
    
    // Hiệu ứng tắt dần tiếng (decay)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  } catch (e) {
    console.warn('Không thể phát âm thanh thông báo (chính sách trình duyệt chặn auto-play):', e);
  }
};

function RealtimeNotificationListener() {
  const toast = useToast();
  const auth = useAuth();
  const initTime = useRef(Date.now());

  useEffect(() => {
    // Chỉ kích hoạt kết nối nếu đã đăng nhập và không phải vai trò Nhân viên thông thường
    if (!auth.isAuthenticated || auth.role === 'Employee') {
      return;
    }

    const notifRef = ref(database, 'admin_notifications');
    
    // Lắng nghe các thông báo đơn nghỉ phép mới
    const unsubscribe = onChildAdded(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.ngay_tao && data.ngay_tao > initTime.current) {
        // Phát âm thanh báo hiệu
        playNotificationSound();
        // Hiển thị popup Toast
        toast.info(data.tieu_de, data.noi_dung, 6000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [toast, auth.isAuthenticated, auth.role]);

  return null;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RealtimeNotificationListener />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;