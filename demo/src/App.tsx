import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faVideo } from '@fortawesome/free-solid-svg-icons'
import { Logo } from './components/Logo/Logo';
import { selectFiles } from './functions/selectFiles';
import { ImageFile } from './models/ImageFile';
import './App.scss';
import { sortNsfwResult } from './functions/sortBy';
import { NsfwSpy, NsfwSpyResult } from '@nsfwspy/browser'

const nsfwSpy = new NsfwSpy("/model/model.json");

export const App: React.FC = () => {
    const [url, setUrl] = useState<string>();
    const [image, setImage] = useState<ImageFile>();
    const [imageResults, setImageResults] = useState<NsfwSpyResult>();
    const [processing, setProcessing] = useState<boolean>(false);

    useEffect(() => {
        const loadNsfwSpyModel = async () => {
            await nsfwSpy.load();
        };

        loadNsfwSpyModel();
    }, [])

    const selectFile = () => {
        selectFiles({ accept: 'image/*;', multiple: false }).then(async files => {
            if (files) {
                handleFile(files[0])
            }
        });
    }

    const handleFile = async (file: Blob) => {
        const imageFile: ImageFile = {
            file: file,
            url: URL.createObjectURL(file)
        };

        setImage(undefined);
        setImageResults(undefined);

        const fileType = imageFile.file.type;

        setProcessing(true);
        if (fileType.startsWith("image/")) {
            setImage(imageFile);
            const bitmap = await createImageBitmap(imageFile.file);
            const result = await nsfwSpy.classifyImage(bitmap)
            setImageResults(result);
        }
        setProcessing(false);
    }

    let sortedImageResults: [string, any][] | undefined = undefined;
    if (imageResults) {
        sortedImageResults = sortNsfwResult(imageResults);
    }

    return (
        <div className="app">
            <header>
                <Logo />
            </header>
            <main>
                <section className="image-section">
                    <div className="image-canvas" onClick={selectFile}>
                        {!image &&
                            <>
                                <div>
                                    Select an image.
                                </div>
                                <div className="icons">
                                    <div><FontAwesomeIcon icon={faImage} /></div>
                                    <div><FontAwesomeIcon icon={faVideo} /></div>
                                </div>
                                <div className="subtitle">
                                    Or paste a link below...
                                </div>
                            </>}
                        {image &&
                            <img src={image.url} className="image-preview" />}
                    </div>
                    <input
                        type="text"
                        placeholder="https://i3.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                        onChange={(e) => setUrl(e.target.value)} />
                </section>
                <section className="results-section">
                    {processing &&
                        <div>
                            Processing...
                        </div>}
                    {sortedImageResults &&
                        <div>
                            {sortedImageResults.map((result) =>
                                <div className={`result-value ${result[0]}`}>
                                    <span>{result[0]}</span>
                                    <span>{result[1].toFixed(10)}</span>
                                </div>
                            )}
                        </div>}
                </section>
            </main >
        </div >
    );
}

export default App;