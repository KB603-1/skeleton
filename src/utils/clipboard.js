import { toast } from 'vue-sonner';

export const copyToClipboard = (text, successMessage = '복사되었습니다!') => {
  // 1. 안전한 환경 (https 또는 localhost)일 때는 최신 API 사용
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('', { description: '링크 복사 성공!' });
      })
      .catch(() => {
        toast.error('복사에 실패했습니다.', { description: text });
      });
  }
  // 2. HTTP IP 접속 (휴대폰 테스트)일 때는 우회 방식 사용
  else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      toast.success(successMessage, { description: text });
    } catch (err) {
      toast.error('복사가 차단되었습니다. 아래 링크를 직접 복사해주세요.', {
        description: text,
      });
    } finally {
      textArea.remove();
    }
  }
};
