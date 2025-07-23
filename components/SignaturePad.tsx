import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

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
            <button type="button" onClick={clear} className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300">Limpiar</button>
            <button type="button" onClick={save} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">Guardar Firma</button>
           </>
        )}
        {isSigned && (
             <button type="button" onClick={clear} className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Borrar Firma</button>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;