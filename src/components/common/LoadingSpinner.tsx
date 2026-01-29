import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    const sizeClass = size === 'md' ? '' : `spinner--${size}`;

    return (
        <div className="loading-spinner">
            <div className={`spinner ${sizeClass}`} />
            {text && <span className="loading-spinner__text">{text}</span>}
        </div>
    );
}
