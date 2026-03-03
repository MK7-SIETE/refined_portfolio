<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * ContactNotification.php
 * Sends the owner (Betsaleel) an email when someone fills the contact form.
 */
class ContactNotification extends Mailable
{
    use Queueable, SerializesModels;

    public array $contactData;

    public function __construct(array $data)
    {
        $this->contactData = $data;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Portfolio] ' . ($this->contactData['subject'] ?: 'New Contact') . ' — from ' . $this->contactData['name'],
            replyTo: [$this->contactData['email']],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-notification',
            with: ['data' => $this->contactData],
        );
    }
}
