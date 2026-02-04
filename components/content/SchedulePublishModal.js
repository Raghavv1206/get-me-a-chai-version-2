'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { FaTimes, FaClock } from 'react-icons/fa';

export default function SchedulePublishModal({ onSchedule, onClose }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [time, setTime] = useState('12:00');

    const handleSchedule = () => {
        const [hours, minutes] = time.split(':');
        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(parseInt(hours), parseInt(minutes));

        if (scheduledDate <= new Date()) {
            alert('Please select a future date and time');
            return;
        }

        onSchedule(scheduledDate);
    };

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-header">
                    <FaClock className="header-icon" />
                    <h2 className="modal-title">Schedule Publication</h2>
                    <p className="modal-subtitle">Choose when to publish this update</p>
                </div>

                <div className="modal-body">
                    <div className="calendar-section">
                        <label className="section-label">Select Date</label>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={{ before: new Date() }}
                            className="custom-calendar"
                        />
                    </div>

                    <div className="time-section">
                        <label className="section-label">Select Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="time-input"
                        />
                        <p className="timezone-info">Timezone: {timezone}</p>
                    </div>

                    <div className="preview-section">
                        <label className="section-label">Scheduled For:</label>
                        <div className="preview-datetime">
                            {selectedDate && time ? (
                                <>
                                    <span className="preview-date">
                                        {selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className="preview-time">at {time}</span>
                                </>
                            ) : (
                                <span className="preview-empty">Select date and time</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="schedule-btn" onClick={handleSchedule}>
                        <FaClock /> Schedule Update
                    </button>
                </div>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            background: white;
            border-radius: 24px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: slideUp 0.4s ease;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f3f4f6;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #6b7280;
            z-index: 1;
          }

          .close-btn:hover {
            background: #e5e7eb;
            color: #374151;
          }

          .modal-header {
            text-align: center;
            padding: 32px 32px 24px;
            border-bottom: 2px solid #f3f4f6;
          }

          .header-icon {
            font-size: 3rem;
            color: #f59e0b;
            margin-bottom: 16px;
          }

          .modal-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
          }

          .modal-subtitle {
            font-size: 1rem;
            color: #6b7280;
            margin: 0;
          }

          .modal-body {
            padding: 32px;
          }

          .calendar-section,
          .time-section,
          .preview-section {
            margin-bottom: 24px;
          }

          .section-label {
            display: block;
            font-size: 0.95rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          }

          :global(.custom-calendar) {
            margin: 0 auto;
          }

          :global(.rdp) {
            --rdp-cell-size: 45px;
            --rdp-accent-color: #667eea;
          }

          .time-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
          }

          .time-input:focus {
            outline: none;
            border-color: #667eea;
          }

          .timezone-info {
            font-size: 0.85rem;
            color: #9ca3af;
            text-align: center;
            margin: 8px 0 0 0;
          }

          .preview-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
          }

          .preview-datetime {
            display: flex;
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .preview-date {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
          }

          .preview-time {
            font-size: 1.5rem;
            font-weight: 700;
            color: #667eea;
          }

          .preview-empty {
            font-size: 1rem;
            color: #9ca3af;
          }

          .modal-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 24px 32px 32px;
            border-top: 2px solid #f3f4f6;
          }

          .cancel-btn,
          .schedule-btn {
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .cancel-btn {
            background: white;
            color: #6b7280;
            border: 2px solid #e5e7eb;
          }

          .cancel-btn:hover {
            background: #f9fafb;
          }

          .schedule-btn {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
          }

          .schedule-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
          }

          @media (max-width: 640px) {
            .modal-content {
              max-width: 100%;
              border-radius: 16px;
            }

            .modal-header,
            .modal-body,
            .modal-actions {
              padding: 24px 20px;
            }

            .modal-actions {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
