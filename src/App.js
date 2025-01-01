import { useEffect, useState } from "react";
import forge from "node-forge";
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import Alert from "./Alert";
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoSendSharp } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";

function App() {
  const alert = new Alert()
  const [files, setFiles] = useState([]);
  const [filesSend, setFilesSend] = useState([])
  const [chunkFile, setChunkFile] = useState({})
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    console.log("filesSend", filesSend);

  }, [filesSend]);

  // Generate RSA Key Pair saat aplikasi dimulai
  useEffect(() => {
    const generateKeys = () => {
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
      const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);

      setPrivateKey(privateKeyPem);
      setPublicKey(publicKeyPem);
    };

    generateKeys();
  }, []);

  const beforeUpload = (e) => {
    const file = e.target.files[0];
    setChunkFile(file)
  }

  const handleSend = (file, index) => {
    setFilesSend((prev) => [
      ...prev,
      file
    ])
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }

  const handleFileUpload = (file) => {
    if (file) {
      let timerInterval;
      Swal.fire({
        title: "Generate AES key and Encrypt AES key with RSA public key",
        html: "I will close in <b></b> milliseconds.",
        timer: 5000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = event.target.result;
          // Mulai pengukuran memori dan waktu
          const start = performance.now();

          // 1. Generate AES key
          const aesKey = CryptoJS.lib.WordArray.random(16).toString();

          // 2. Encrypt file data with AES
          const encryptedData = CryptoJS.AES.encrypt(fileData, aesKey).toString();


          // 3. Encrypt AES key with RSA public key
          const publicKeyForge = forge.pki.publicKeyFromPem(publicKey);
          const encryptedKey = publicKeyForge.encrypt(aesKey, "RSA-OAEP");

          const end = performance.now();

          const encryptionTime = (end - start).toFixed(2);
          const memoryUsed = new Blob([encryptedData]).size / 1024; // KB
          console.log("memoryUsed", memoryUsed);

          const fileSize = new Blob([fileData]).size;
          const encryptedFileSize = new Blob([encryptedData]).size;

          // 4. Menyimpan pada list file
          setFiles((prevFiles) => [
            ...prevFiles,
            {
              name: file.name,
              encryptedData,
              encryptedKey,
              size: fileSize,
              encryptedSize: encryptedFileSize,
              encryptionTime: encryptionTime,
              memoryUsed: memoryUsed ? memoryUsed.toFixed(2) : "Not available",
            },
          ]);
        };
        reader.readAsText(file);
        alert.successCreate()
        setChunkFile({})
      });
    }
  };

  const handleDeskrip = (file, index) => {
    // 1. Decrypt AES key dengan RSA private key
    const privateKeyForge = forge.pki.privateKeyFromPem(privateKey);
    const decryptedKey = privateKeyForge.decrypt(file.encryptedKey, "RSA-OAEP");

    // 2. Decrypt file data dengan AES
    const decryptedData = CryptoJS.AES.decrypt(file.encryptedData, decryptedKey)
      .toString(CryptoJS.enc.Utf8);

    const end = performance.now();
    const decryptedFileSize = new Blob([decryptedData]).size;

    let timerInterval;
    Swal.fire({
      title: "Decrypt AES key dengan RSA private key dan Decrypt file data dengan AES",
      html: "Dekripsi Dijalankan <b></b> milliseconds.",
      timer: 5000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {
          timer.textContent = `${Swal.getTimerLeft()}`;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then(() => {
      setFilesSend((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = {
          ...updatedFiles[index],
          end: end,
          decryptedFileSize: decryptedFileSize,
          decryptedData: decryptedData,
        };
        return updatedFiles;
      });
    })
  };

  const handleDownload = (file) => {
    // 3. Trigger saat download file
    const blob = new Blob([file.decryptedData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    alert.successCustom(`Download File ${file.name} Berhasil`)
  }

  const handleDelete = (index) => {
    Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Setelah dihapus, file tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        alert.successDeleteFile()
      }
    });
  };

  return (
    <div className="flex flex-col space-y-10">
      <div className="bg-blue-300 w-full">
        <img className="w-auto h-28" alt="logo" src="https://uai.ac.id/wp-content/uploads/2019/03/Logo-White-02.png" />
      </div>
      <h1 className="text-xl font-bold mb-4 ml-10">Pengirim</h1>
      <div className="flex flex-col space-y-5">
        <div className="flex flex-row justify-center space-x-5">
          <div>
            <h1 className="text-xl font-bold mb-4">File Encryptor</h1>
            <div class="shadow-lg flex items-center justify-center w-full" onChange={beforeUpload}>
              <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 ">
                <div class="flex flex-col items-center justify-center p-5">
                  <svg class="w-8 h-8 mb-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 "><span class="font-semibold">Click to upload</span> or drag and drop</p>
                  <p class="text-xs text-gray-500 ">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input id="dropzone-file" type="file" class="hidden" />
              </label>
            </div>

          </div>
          <div className="list-disc pl-5 w-1/2 rounded-md p-5 border-2 shadow-lg space-y-5 bg-slate-50">
            <div className="flex flex-row justify-between items-center">
              <span className={`${!chunkFile.name && 'italic'}`}>{chunkFile.name ? chunkFile.name : 'Upload file terlebih dahulu'}</span>
              <button
                disabled={!chunkFile.name}
                onClick={() => { handleFileUpload(chunkFile) }}
                className={`${chunkFile.name ? 'bg-blue-500' : 'bg-blue-200'} text-white w-auto h-10 px-4 py-2 rounded shadow-lg flex flex-row items-center`}
              >
                <FaLock className="mr-2" />
                Enkripsi File
              </button>
            </div>
            <hr className="py-2" />
            <span className="text-xl font-bold pb-8">List File</span>
            {files.map((file, index) => (
              <li key={index} className="flex flex-row items-center justify-between mb-4 border px-2 py-5 rounded shadow-lg">
                <div className="flex flex-col">
                  <span>{file.name}</span>
                  <div className="mt-2 text-sm flex flex-row items-center space-x-2">
                    <div className="font-semibold">
                      <p>Ukuran Asli</p>
                      <p>Ukuran Terenkripsi</p>
                      <p>Waktu Enkripsi</p>
                      <p>RAM / CPU</p>
                    </div>
                    <div className="font-bold">
                      <p>:</p>
                      <p>:</p>
                      <p>:</p>
                      <p>:</p>
                    </div>
                    <div>
                      <p>{file.size} bytes</p>
                      <p>{file.encryptedSize} bytes</p>
                      <p>{file.encryptionTime} ms</p>
                      <p>{file.memoryUsed} kb</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSend(file, index)}
                    className="bg-blue-500 text-white w-full h-10 px-4 py-2 rounded shadow-lg flex flex-row items-center"
                  >
                    <IoSendSharp className="mr-2" />
                    Kirim
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white w-full h-10 px-4 py-2 rounded shadow-lg flex flex-row items-center"
                  >
                    <MdDelete className="mr-2" />

                    Delete
                  </button>
                </div>
              </li>
            ))}
          </div>
        </div>

        <hr />

        <h1 className="text-xl font-bold mb-4 ml-10">Penerima</h1>
        <div className="flex flex-row justify-center space-x-5">
          <div className="list-disc pl-5 w-1/2 rounded-md p-5 border-2 shadow-lg space-y-5 bg-slate-50">
            <span className="text-xl font-bold pb-8">List File</span>
            {filesSend.map((file, index) => (
              <li key={index} className="flex flex-row items-center justify-between mb-4 border px-2 py-5 rounded shadow-lg">
                <div className="flex flex-col">
                  <span>{file.name}</span>
                  <div className="mt-2 text-sm flex flex-row space-x-2">
                    <div className="font-semibold">
                      <p>Ukuran Asli</p>
                      <p>Ukuran Terenkripsi</p>
                      <p>Waktu Enkripsi</p>
                      <p>RAM / CPU</p>
                      <br />
                      <p>Waktu Deskripsi</p>
                      <p>Ukuran Deskripsi</p>
                    </div>
                    <div className="font-bold">
                      <p>:</p>
                      <p>:</p>
                      <p>:</p>
                      <p>:</p>
                      <br />
                      <p>:</p>
                      <p>:</p>
                    </div>
                    <div>
                      <p>{file.size} bytes</p>
                      <p>{file.encryptedSize} bytes</p>
                      <p>{file.encryptionTime} ms</p>
                      <p>{file.memoryUsed} kb</p>
                      <br />
                      <p>{file.end ? `${file.end} ms` : ''}</p>
                      <p>{file.decryptedFileSize ? `${file.decryptedFileSize} bytes` : ''}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => file.decryptedFileSize ? handleDownload(file) : handleDeskrip(file, index)}
                    className="bg-blue-500 text-white w-full h-10 px-4 py-2 rounded shadow-lg flex flex-row items-center"
                  >

                    {file.decryptedFileSize ? <FaDownload className="mr-2" /> : <FaLockOpen className="mr-2" />}
                    {file.decryptedFileSize ? 'Download' : `Dekripsi File`}
                  </button>
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
