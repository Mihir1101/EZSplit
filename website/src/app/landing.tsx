import { Connect } from './wallet/connect';

export default function Landing() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-black-100">
                <div>Connect to Metamask</div>
                <Connect />
            </div>
        </>
    );
}