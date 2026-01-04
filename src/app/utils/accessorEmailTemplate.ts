// Examiner Interview Invitation Template
export const examinerInterviewInvitationTemplate = (
  examinerName: string,
  interviewDate: string,
  interviewTime?: string,
  interviewVenue?: string
) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background-color: #f8fafc; 
            color: #333; 
            line-height: 1.6; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #fff; 
            border-radius: 10px; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
            overflow: hidden; 
        }
        .header { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
            color: #fff; 
            padding: 25px; 
            text-align: center; 
        }
        .header h2 { 
            font-size: 22px; 
            margin: 0; 
            font-weight: 700; 
        }
        .header p {
            margin-top: 8px;
            font-size: 14px;
            opacity: 0.9;
        }
        .content { 
            padding: 25px; 
        }
        .greeting { 
            font-size: 16px; 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 15px; 
        }
        .main-text { 
            color: #4b5563; 
            margin-bottom: 15px; 
            font-size: 14px;
            line-height: 1.6;
        }
        .interview-box { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border: 2px solid #2563eb; 
        }
        .interview-box h3 { 
            color: #1e40af; 
            margin-bottom: 15px; 
            font-size: 18px;
            font-weight: 700;
            text-align: center;
        }
        .info-grid {
            display: grid;
            gap: 12px;
        }
        .info-item {
            background: #fff;
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .info-label { 
            font-weight: 700; 
            color: #1e40af; 
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value { 
            color: #1f2937; 
            font-weight: 600;
            font-size: 15px;
        }
        .venue-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .venue-box strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .venue-box p {
            color: #78350f;
            font-size: 14px;
            font-weight: 500;
        }
        .notes { 
            background-color: #fffbeb; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
            border-left: 4px solid #f59e0b; 
            font-size: 14px;
            color: #92400e;
        }
        .notes strong {
            display: block;
            margin-bottom: 8px;
            color: #78350f;
        }
        .footer { 
            text-align: center; 
            color: #6b7280; 
            background-color: #f9fafb; 
            padding: 20px; 
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
        }
        .footer p { margin: 5px 0; }
        .footer a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Interview Invitation – BASE Membership Evaluation</h2>
        </div>
        <div class="content">
            <p class="greeting">Dear ${examinerName},</p>
            <p class="main-text">
                You have been invited to participate as an examiner in the upcoming <strong>BASE (Bangladesh Association of Structural Engineers)</strong> membership interview session.
            </p>

            <div class="interview-box">
                <h3>📋 Interview Schedule</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Date</div>
                        <div class="info-value">${interviewDate}</div>
                    </div>
                    ${interviewTime ? `
                    <div class="info-item">
                        <div class="info-label">Time</div>
                        <div class="info-value">${interviewTime}</div>
                    </div>
                    ` : ''}
                    ${interviewVenue ? `
                    <div class="info-item">
                        <div class="info-label">Venue</div>
                        <div class="info-value">${interviewVenue}</div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <p class="main-text">
                Your participation and valuable evaluation will play an important role in maintaining the professional standard of the BASE membership selection process.
            </p>

            <p class="main-text">
                Thank you for your time and contribution.
            </p>

            <p class="main-text" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <strong>Warm regards,</strong><br/>
                BASE Membership Committee
            </p>
        </div>
        
        <div class="footer">
            <p><strong>BASE Membership Committee</strong></p>
            <p>📧 basebd25@gmail.com</p>
            <p><a href="https://basebd.org">🌐 https://basebd.org</a></p>
        </div>
    </div>
</body>
</html>
`;
