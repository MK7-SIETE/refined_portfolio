<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * ContactAutoReply.php
 * Sends a branded auto-reply to the person who filled the contact form.
 */
class ContactAutoReply extends Mailable
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
            subject: 'Thanks for reaching out, ' . $this->contactData['name'] . '! 👋',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-autoreply',
            with: ['data' => $this->contactData],
        );
    }
}
