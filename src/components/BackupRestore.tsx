import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Download, Upload, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import CryptoJS from 'crypto-js';

interface Props {
    onClose: () => void;
}

const BackupRestore: React.FC<Props> = ({ onClose }) => {
    const { chits, auctionSheets, payments, prizes, restoreData, verifyPin } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportPin, setExportPin] = useState('');
    const [showExportPinModal, setShowExportPinModal] = useState(false);

    const handleExportWithPin = async () => {
        if (!verifyPin(exportPin)) {
            toast.error("Invalid PIN! Backup cannot be created.");
            return;
        }

        setShowExportPinModal(false);
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const data = {
                chits,
                auctionSheets,
                payments,
                prizes,
                exportDate: new Date().toISOString(),
                version: '2.0' // Incremented for encryption support
            };

            const jsonString = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonString, exportPin).toString();
            const fileName = `chits_backup_${new Date().toISOString().split('T')[0]}.csv`;

            if (Capacitor.isNativePlatform()) {
                try {
                    // Request permissions to write to external storage
                    await Filesystem.requestPermissions();

                    // Write directly to Downloads folder (publicly accessible)
                    await Filesystem.writeFile({
                        path: `Download/${fileName}`,
                        data: encrypted,
                        directory: Directory.ExternalStorage,
                        encoding: Encoding.UTF8,
                    });
                    toast.success(`✅ Backup saved to Downloads/${fileName}`);
                } catch (_permErr) {
                    // Fallback: write to cache and open share sheet
                    const result = await Filesystem.writeFile({
                        path: fileName,
                        data: encrypted,
                        directory: Directory.Cache,
                        encoding: Encoding.UTF8,
                    });
                    await Share.share({
                        title: 'SWChits Backup',
                        text: 'Your encrypted SWChits backup data',
                        url: result.uri,
                        dialogTitle: 'Save Backup to Downloads or Drive'
                    });
                    toast.success('Select "Save to Files" or "Downloads" in the share menu.');
                }
            } else {
                const blob = new Blob([encrypted], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    if (document.body && document.body.contains(link)) {
                        document.body.removeChild(link);
                    }
                    URL.revokeObjectURL(url);
                }, 100);

                toast.success('Encrypted backup file created and download started!');
            }
            setExportPin('');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create backup.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const importPin = window.prompt("Enter the 6-digit PIN used to encrypt this backup:");
        if (!importPin) {
            toast.error("PIN is required to import data.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const encryptedContent = e.target?.result as string;
                const bytes = CryptoJS.AES.decrypt(encryptedContent, importPin);
                const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

                if (!decryptedData) {
                    throw new Error("Invalid PIN or corrupted file.");
                }

                const json = JSON.parse(decryptedData);

                // Basic validation
                if (!json.chits || !Array.isArray(json.chits)) {
                    throw new Error('Invalid backup file format.');
                }

                if (window.confirm('This will OVERWRITE all current data. Are you sure?')) {
                    restoreData(json);
                    toast.success('Data restored successfully!');
                    onClose();
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to import data. Incorrect PIN or invalid backup file.');
            }
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onClose} className="btn-secondary p-2 group hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary-500" />
                    Backup & Restore
                </h1>
            </div>

            <div className="space-y-6">
                {/* Backup Section */}
                <div className="card shadow-md border-slate-200 bg-white p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Backup Data</h3>
                            <p className="text-slate-500 text-sm">Download all your current chits, auctions, and payments data as a single file to keep it safe.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowExportPinModal(true)}
                        disabled={isExporting}
                        className="w-full btn-primary py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Export as CSV
                            </>
                        )}
                    </button>
                </div>

                {/* PIN Modal Overlay */}
                {showExportPinModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-4 text-primary-600">
                                <ShieldCheck className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Verify Identity</h3>
                            </div>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Please enter your <b>6-digit PIN</b> to authorize this data export.</p>

                            <input
                                type="password"
                                maxLength={6}
                                className="input-field text-center text-3xl tracking-[1.5rem] font-black h-20 mb-6 bg-slate-50 focus:bg-white border-2"
                                placeholder="••••••"
                                value={exportPin}
                                onChange={(e) => setExportPin(e.target.value.replace(/\D/g, ''))}
                                autoFocus
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setShowExportPinModal(false); setExportPin(''); }}
                                    className="flex-1 btn-secondary py-3 text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExportWithPin}
                                    disabled={exportPin.length !== 6}
                                    className="flex-[2] btn-primary py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:shadow-none"
                                >
                                    Verify & Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Restore Section */}
                <div className="card shadow-md border-slate-200 bg-white p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Restore Data</h3>
                            <p className="text-slate-500 text-sm">Upload an encrypted backup CSV file to restore your data. PIN will be required.</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium">
                            <b>Warning:</b> Restoring data will replace all your current information. You must use the PIN that was active when the backup was created.
                        </p>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".csv"
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full btn-secondary py-4 font-bold flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-50"
                    >
                        <Upload className="w-5 h-5" />
                        Import from Device
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;
