
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from './common/Button';

interface SignaturePadProps {
  title: string;
  onSave: (dataUrl: string) => void;
  signatureDataUrl?: string;
  isSigned: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ title, onSave, signatureDataUrl, isSigned }) => {
  const sigPadRef = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigPadRef.current?.clear();
    onSave('');
  };

  const save = () => {
    if (sigPadRef.current) {
        if (sigPadRef.current.isEmpty()) {
            alert("Por favor, provea una firma.");
            return;
        }
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="border border-slate-300 rounded-lg bg-white relative">
        {isSigned && signatureDataUrl ? (
          <img src={signatureDataUrl} alt={`${title} Signature`} className="w-full h-40 object-contain" />
        ) : (
          <SignatureCanvas
            ref={sigPadRef}
            canvasProps={{ className: 'w-full h-40 rounded-lg' }}
          />
        )}
      </div>
      <div className="flex items-center space-x-2 mt-2 no-print">
        {!isSigned && (
           <>
            <Button type="button" onClick={clear} variant="secondary" className="text-sm py-1">Limpiar</Button>
            <Button type="button" onClick={save} variant="primary" className="text-sm py-1">Guardar Firma</Button>
           </>
        )}
        {isSigned && (
             <Button type="button" onClick={clear} variant="danger" className="text-sm py-1">Borrar Firma</Button>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;