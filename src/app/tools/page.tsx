"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { FileText, Book, PenTool, RefreshCw, UserCircle, Building2, Globe, Feather, Pencil, Wand2, User, Music, Mic, Smile, HelpCircle, Quote, Search, Target, Sunset, Edit, Lightbulb, Utensils, Film, Glasses, Heart,  ShoppingBag, ShoppingCart, Package, Star, Store, Award, List, Tag, Briefcase, Gift, Layers, FileSignature, FileSearch, Eraser, FileText as FileTextIcon, Shuffle, Key, FileQuestion, Dice1, ScrollText, Anchor, Signature, Type, Book as BookIcon, AlignLeft, AtSign, MessageSquare, ShoppingCart as ShoppingCartIcon, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/footer'

const categories = [
  { icon: <FileText className="w-4 h-4" />, name: 'Alle', id: 'all' },
  { icon: <PenTool className="w-4 h-4" />, name: 'Artikler og SEO', id: 'articles' },
  { icon: <Pencil className="w-4 h-4" />, name: 'Kreativ Skriving', id: 'creative' },
  { icon: <Building2 className="w-4 h-4" />, name: 'Forretning', id: 'business' },
  { icon: <Type className="w-4 h-4" />, name: 'Slagordgenerator', id: 'slogan' },
  { icon: <FileText className="w-4 h-4" />, name: 'Andre', id: 'others' },
  { icon: <AtSign className="w-4 h-4" />, name: 'E-post', id: 'email' },
  { icon: <MessageSquare className="w-4 h-4" />, name: 'Sosiale medier', id: 'social-media' },
  { icon: <ShoppingCartIcon className="w-4 h-4" />, name: 'Netthandel & eCom', id: 'netthandel' },
  { icon: <MoreHorizontal className="w-4 h-4" />, name: 'Diverse', id: 'diverse' },
]

const tools = [
  { id: 'ai-book-writer', name: 'AI Bokforfatter', description: 'Skriv bøker effektivt med AI-assistanse.', category: 'creative', icon: <Book className="w-5 h-5" /> },
  { id: 'ai-story-generator', name: 'AI Historiegenerator', description: 'Generer unike historier med AI-teknologi.', category: 'creative', icon: <BookIcon className="w-5 h-5" /> },
  { id: 'ai-writer', name: 'AI Skribent', description: 'Få hjelp til all type skriving med vår AI.', category: 'articles', icon: <PenTool className="w-5 h-5" /> },
  { id: 'article-rewriter', name: 'Artikkelomskriver', description: 'Omskriv artikler for unikt innhold.', category: 'articles', icon: <RefreshCw className="w-5 h-5" /> },
  { id: 'author-bio-generator', name: 'Forfatterbiografi-generator', description: 'Lag profesjonelle forfatterbiografier.', category: 'others', icon: <UserCircle className="w-5 h-5" /> },
  { id: 'business-name-generator', name: 'Bedriftsnavn-generator', description: 'Generer unike navn for din bedrift.', category: 'business', icon: <Building2 className="w-5 h-5" /> },
  { id: 'domain-name-generator', name: 'Domenenavn-generator', description: 'Finn det perfekte domenenavnet.', category: 'business', icon: <Globe className="w-5 h-5" /> },
  { id: 'dragon-name-generator', name: 'Dragenavn-generator', description: 'Skap episke navn for drager.', category: 'creative', icon: <Feather className="w-5 h-5" /> },
  { id: 'essay-writer', name: 'Essayskriver', description: 'Få hjelp til å skrive overbevisende essays.', category: 'articles', icon: <Pencil className="w-5 h-5" /> },
  { id: 'fantasy-name-generator', name: 'Fantasy-navn-generator', description: 'Lag unike navn for fantasykarakterer.', category: 'creative', icon: <Wand2 className="w-5 h-5" /> },
  { id: 'last-name-generator', name: 'Etternavn-generator', description: 'Generer realistiske etternavn.', category: 'creative', icon: <User className="w-5 h-5" /> },
  { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum-generator', description: 'Lag fylltekst for design og oppsett.', category: 'others', icon: <FileTextIcon className="w-5 h-5" /> },
  { id: 'lyrics-generator', name: 'Sangtekst-generator', description: 'Skap inspirerende sangtekster.', category: 'creative', icon: <Music className="w-5 h-5" /> },
  { id: 'paragraph-generator', name: 'Avsnitt-generator', description: 'Generer meningsfulle avsnitt.', category: 'articles', icon: <Layers className="w-5 h-5" /> },
  { id: 'paragraph-rewriter', name: 'Avsnitt-omskriver', description: 'Omskriv avsnitt for bedre flyt.', category: 'articles', icon: <FileSignature className="w-5 h-5" /> },
  { id: 'paraphrasing-tool', name: 'Parafraseringsverktøy', description: 'Omformuler tekst uten å miste mening.', category: 'articles', icon: <FileSearch className="w-5 h-5" /> },
  { id: 'plagiarism-remover', name: 'Plagiatsfjerner', description: 'Gjør innhold unikt og plagiatfritt.', category: 'articles', icon: <Eraser className="w-5 h-5" /> },
  { id: 'poem-generator', name: 'Dikt-generator', description: 'Skap vakre dikt med AI.', category: 'creative', icon: <Feather className="w-5 h-5" /> },
  { id: 'press-release-generator', name: 'Pressemelding-generator', description: 'Lag profesjonelle pressemeldinger.', category: 'business', icon: <FileTextIcon className="w-5 h-5" /> },
  { id: 'privacy-policy-generator', name: 'Personvern-generator', description: 'Generer personvernerklæringer.', category: 'business', icon: <ScrollText className="w-5 h-5" /> },
  { id: 'random-name-generator', name: 'Tilfeldig navn-generator', description: 'Generer tilfeldige navn for ulike formål.', category: 'creative', icon: <Shuffle className="w-5 h-5" /> },
  { id: 'random-password-generator', name: 'Tilfeldig passord-generator', description: 'Lag sikre, tilfeldige passord.', category: 'others', icon: <Key className="w-5 h-5" /> },
  { id: 'random-question-generator', name: 'Tilfeldig spørsmål-generator', description: 'Generer interessante, tilfeldige spørsmål.', category: 'others', icon: <FileQuestion className="w-5 h-5" /> },
  { id: 'random-word-generator', name: 'Tilfeldig ord-generator', description: 'Generer tilfeldige ord for kreativitet.', category: 'creative', icon: <AtSign className="w-5 h-5" /> },
  { id: 'refund-policy-generator', name: 'Refusjonspolicy-generator', description: 'Lag klare refusjonspolicyer.', category: 'business', icon: <ScrollText className="w-5 h-5" /> },
  { id: 'script-generator', name: 'Manus-generator', description: 'Skap engasjerende manus for video.', category: 'creative', icon: <FileTextIcon className="w-5 h-5" /> },
  { id: 'sentence-expander', name: 'Setningsekspanderer', description: 'Utvid korte setninger til lengre.', category: 'articles', icon: <AlignLeft className="w-5 h-5" /> },
  { id: 'ship-name-generator', name: 'Skipsnavn-generator', description: 'Generer unike navn for skip og fartøy.', category: 'creative', icon: <Anchor className="w-5 h-5" /> },
  { id: 'signature-generator', name: 'Signatur-generator', description: 'Lag profesjonelle e-postsignaturer.', category: 'business', icon: <Signature className="w-5 h-5" /> },
  { id: 'slogan-generator', name: 'Slagord-generator', description: 'Lag fengende slagord for din merkevare.', category: 'slogan', icon: <Type className="w-5 h-5" /> },
  { id: 'story-summarizer', name: 'Historie-oppsummerer', description: 'Oppsummer lange historier effektivt.', category: 'articles', icon: <FileTextIcon className="w-5 h-5" /> },
  { id: 'username-generator', name: 'Brukernavn-generator', description: 'Generer unike og kreative brukernavn.', category: 'others', icon: <AtSign className="w-5 h-5" /> },
  { id: 'ai-email-writer', name: 'AI E-postskriver', description: 'Skriv profesjonelle e-poster med AI.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'ai-response-generator', name: 'AI Svar-generator', description: 'Generer raske og passende e-postsvar.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'ai-letter-generator', name: 'AI Brev-generator', description: 'Lag formelle og uformelle brev med AI.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'marketing-email-generator', name: 'Markedsførings-e-postgenerator', description: 'Lag effektive markedsførings-e-poster.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'thank-you-letter-generator', name: 'Takkebrev-generator', description: 'Generer takkemeldinger og brev.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'welcome-email-generator', name: 'Velkomst-e-postgenerator', description: 'Lag velkomstmeldinger for nye brukere.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'love-letter-generator', name: 'Kjærlighetsbrev-generator', description: 'Skriv romantiske kjærlighetsbrev.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'sales-letter-generator', name: 'Salgsbrev-generator', description: 'Lag overbevisende salgsbrev.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'recommendation-letter-generator', name: 'Anbefalingsbrev-generator', description: 'Generer profesjonelle anbefalingsbrev.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'resignation-letter-generator', name: 'Oppsigelsesbrev-generator', description: 'Lag formelle oppsigelsesbrev.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'termination-letter-generator', name: 'Oppsigelsesbrev-generator', description: 'Generer oppsigelsesbrev for ansatte.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'fundraising-letter-generator', name: 'Innsamlingsbrev-generator', description: 'Lag effektive innsamlingsbrev.', category: 'email', icon: <AtSign className="w-5 h-5" /> },
  { id: 'hashtag-generator', name: 'Hashtag-generator', description: 'Generer relevante hashtags for sosiale medier.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tweet-and-threads-generator', name: 'Tweet- og tråd-generator', description: 'Lag engasjerende tweets og tråder.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'facebook-ad-copy-generator', name: 'Facebook-annonsetekst-generator', description: 'Skap effektive annonsetekster for Facebook.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'script-generator', name: 'Manus-generator', description: 'Skap engasjerende manus for video.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'company-bio-generator', name: 'Bedriftsbiografi-generator', description: 'Lag profesjonelle bedriftsbiografier.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'linkedin-headline-generator', name: 'LinkedIn-overskrift-generator', description: 'Generer fengende overskrifter for LinkedIn.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'google-ad-copy-generator', name: 'Google-annonsetekst-generator', description: 'Skap effektive annonsetekster for Google.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'instagram-caption-generator', name: 'Instagram-bildetekst-generator', description: 'Lag engasjerende bildetekster for Instagram.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tiktok-caption-generator', name: 'TikTok-bildetekst-generator', description: 'Skap fengende bildetekster for TikTok.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'instagram-bio-generator', name: 'Instagram-bio-generator', description: 'Generer kreative bios for Instagram.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'snapchat-bio-generator', name: 'Snapchat-bio-generator', description: 'Lag unike bios for Snapchat.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'facebook-bio-generator', name: 'Facebook-bio-generator', description: 'Skap interessante bios for Facebook.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'twitch-bio-generator', name: 'Twitch-bio-generator', description: 'Generer kreative bios for Twitch.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'linkedin-bio-generator', name: 'LinkedIn-bio-generator', description: 'Lag profesjonelle bios for LinkedIn.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'pinterest-bio-generator', name: 'Pinterest-bio-generator', description: 'Skap kreative bios for Pinterest.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'twitter-bio-generator', name: 'Twitter-bio-generator', description: 'Generer interessante bios for Twitter.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tiktok-bio-generator', name: 'TikTok-bio-generator', description: 'Lag kreative bios for TikTok.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tiktok-hashtag-generator', name: 'TikTok-hashtag-generator', description: 'Generer relevante hashtags for TikTok.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-hashtag-generator', name: 'YouTube-hashtag-generator', description: 'Skap relevante hashtags for YouTube.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'quora-answer-generator', name: 'Quora-svar-generator', description: 'Generer informative svar for Quora.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-description-generator', name: 'YouTube-beskrivelse-generator', description: 'Lag engasjerende beskrivelser for YouTube.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tiktok-script-generator', name: 'TikTok-manus-generator', description: 'Skap engasjerende manus for TikTok.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-script-generator', name: 'YouTube-manus-generator', description: 'Lag engasjerende manus for YouTube.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-title-generator', name: 'YouTube-tittel-generator', description: 'Generer fengende titler for YouTube.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'webinar-title-generator', name: 'Webinar-tittel-generator', description: 'Skap interessante titler for webinarer.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'podcast-script-generator', name: 'Podcast-manus-generator', description: 'Lag engasjerende manus for podcast.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tinder-bio-generator', name: 'Tinder-bio-generator', description: 'Generer kreative bios for Tinder.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'bumble-bio-generator', name: 'Bumble-bio-generator', description: 'Lag unike bios for Bumble.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'video-topic-ideas-generator', name: 'Videotema-ide-generator', description: 'Generer inspirerende temaideer for video.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'video-title-generator', name: 'Videotittel-generator', description: 'Lag fengende titler for video.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'ad-copy-generator', name: 'Annonsetekst-generator', description: 'Skap effektive annonsetekster.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'ad-headline-generator', name: 'Annonsetittel-generator', description: 'Generer fengende annonsetitler.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-tag-generator', name: 'YouTube-tag-generator', description: 'Lag relevante tagger for YouTube.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'linkedin-recommendation-generator', name: 'LinkedIn-anbefaling-generator', description: 'Generer profesjonelle anbefalinger for LinkedIn.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'cute-instagram-name-generator', name: 'Sjokkerende Instagram-navn-generator', description: 'Lag kreative og sjokkerende brukernavn for Instagram.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-name-generator', name: 'YouTube-navn-generator', description: 'Generer unike navn for YouTube-kanaler.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'youtube-channel-description-generator', name: 'YouTube-kanalbeskrivelse-generator', description: 'Lag engasjerende beskrivelser for YouTube-kanaler.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'username-generator', name: 'Brukernavn-generator', description: 'Generer unike og kreative brukernavn.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'tiktok-username-generator', name: 'TikTok-brukernavn-generator', description: 'Lag unike brukernavn for TikTok.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'linkedin-post-generator', name: 'LinkedIn-innlegg-generator', description: 'Generer engasjerende innlegg for LinkedIn.', category: 'social-media', icon: <AtSign className="w-5 h-5" /> },
  { id: 'product-description-generator', name: 'Produktbeskrivelse-generator', description: 'Lag engasjerende produktbeskrivelser.', category: 'netthandel', icon: <FileText className="w-5 h-5" /> },
{ id: 'amazon-product-description-generator', name: 'Amazon-produktbeskrivelse-generator', description: 'Optimaliser produktbeskrivelser for Amazon.', category: 'netthandel', icon: <ShoppingCart className="w-5 h-5" /> },
{ id: 'shopify-product-description-generator', name: 'Shopify-produktbeskrivelse-generator', description: 'Lag overbevisende beskrivelser for Shopify-butikker.', category: 'netthandel', icon: <ShoppingBag className="w-5 h-5" /> },
{ id: 'etsy-product-description-generator', name: 'Etsy-produktbeskrivelse-generator', description: 'Skap attraktive produktbeskrivelser for Etsy.', category: 'netthandel', icon: <Gift className="w-5 h-5" /> },
{ id: 'testimonials-reviews-generator', name: 'Anmeldelser-generator', description: 'Generer overbevisende kundevurderinger.', category: 'netthandel', icon: <Star className="w-5 h-5" /> },
{ id: 'store-description-generator', name: 'Butikkbeskrivelse-generator', description: 'Lag unike beskrivelser for din nettbutikk.', category: 'netthandel', icon: <Store className="w-5 h-5" /> },
{ id: 'flipkart-product-description-generator', name: 'Flipkart-produktbeskrivelse-generator', description: 'Optimaliser produktbeskrivelser for Flipkart.', category: 'netthandel', icon: <Package className="w-5 h-5" /> },
{ id: 'features-to-benefit-converter', name: 'Funksjoner-til-fordeler-konverter', description: 'Konverter produktfunksjoner til kundfordeler.', category: 'netthandel', icon: <RefreshCw className="w-5 h-5" /> },
{ id: 'value-proposition-generator', name: 'Verdiforslag-generator', description: 'Lag overbevisende verdiforslag for dine produkter.', category: 'netthandel', icon: <Award className="w-5 h-5" /> },
{ id: 'product-features-generator', name: 'Produktfunksjoner-generator', description: 'Generer detaljerte produktfunksjoner.', category: 'netthandel', icon: <List className="w-5 h-5" /> },
{ id: 'product-name-generator', name: 'Produktnavn-generator', description: 'Skap unike og minneverdige produktnavn.', category: 'netthandel', icon: <Tag className="w-5 h-5" /> },
{ id: 'ai-business-name-generator', name: 'AI-bedriftsnavn-generator', description: 'Lag kreative bedriftsnavn med AI.', category: 'netthandel', icon: <Briefcase className="w-5 h-5" /> },
{ id: 'ai-prompt-generator', name: 'AI-prompt-generator', description: 'Lag effektive AI-prompts for bedre resultater.', category: 'diverse', icon: <Wand2 className="w-5 h-5" /> },
{ id: 'wedding-hashtag-generator', name: 'Bryllups-hashtag-generator', description: 'Skap unike hashtags for ditt bryllup.', category: 'diverse', icon: <Heart className="w-5 h-5" /> },
{ id: 'bachelorette-hashtag-generator', name: 'Utdrikningslag-hashtag-generator', description: 'Generer morsomme hashtags for utdrikningslaget.', category: 'diverse', icon: <Glasses className="w-5 h-5" /> },
{ id: 'resume-summary-generator', name: 'CV-sammendrag-generator', description: 'Lag et overbevisende sammendrag for din CV.', category: 'diverse', icon: <FileText className="w-5 h-5" /> },
{ id: 'song-lyrics-generator', name: 'Sangtekst-generator', description: 'Skap kreative sangtekster med AI.', category: 'diverse', icon: <Music className="w-5 h-5" /> },
{ id: 'speech-generator', name: 'Tale-generator', description: 'Generer engasjerende taler for enhver anledning.', category: 'diverse', icon: <Mic className="w-5 h-5" /> },
{ id: 'acronym-generator', name: 'Akronym-generator', description: 'Lag minneverdige akronymer for ditt firma eller prosjekt.', category: 'diverse', icon: <Type className="w-5 h-5" /> },
{ id: 'interview-question-generator', name: 'Intervjuspørsmål-generator', description: 'Generer relevante spørsmål for jobbintervjuer.', category: 'diverse', icon: <HelpCircle className="w-5 h-5" /> },
{ id: 'movie-script-generator', name: 'Filmmanuskript-generator', description: 'Skap unike filmmanuskripter med AI.', category: 'diverse', icon: <Film className="w-5 h-5" /> },
{ id: 'resume-bullet-point-generator', name: 'CV-kulepunkt-generator', description: 'Lag effektive kulepunkter for din CV.', category: 'diverse', icon: <List className="w-5 h-5" /> },
{ id: 'job-description-generator', name: 'Stillingsutlysning-generator', description: 'Skap detaljerte og attraktive stillingsutlysninger.', category: 'diverse', icon: <Briefcase className="w-5 h-5" /> },
{ id: 'funeral-speech-generator', name: 'Begravelsestale-generator', description: 'Lag meningsfulle taler for begravelser.', category: 'diverse', icon: <Feather className="w-5 h-5" /> },
{ id: 'food-description-generator', name: 'Matbeskrivelse-generator', description: 'Skap appetittvekkende matbeskrivelser.', category: 'diverse', icon: <Utensils className="w-5 h-5" /> },
{ id: 'fiverr-description-generator', name: 'Fiverr-beskrivelse-generator', description: 'Lag overbevisende Fiverr-gig-beskrivelser.', category: 'diverse', icon: <FileText className="w-5 h-5" /> },
{ id: 'resume-bio-generator', name: 'CV-bio-generator', description: 'Generer en profesjonell bio for din CV.', category: 'diverse', icon: <User className="w-5 h-5" /> },
{ id: 'startup-ideas-generator', name: 'Startup-idé-generator', description: 'Få inspirasjon til innovative startup-ideer.', category: 'diverse', icon: <Lightbulb className="w-5 h-5" /> },
{ id: 'mission-statement-generator', name: 'Misjonsuttalelse-generator', description: 'Lag en kraftfull misjonsuttalelse for din bedrift.', category: 'diverse', icon: <Target className="w-5 h-5" /> },
{ id: 'marriage-proposal-generator', name: 'Frieri-generator', description: 'Skap et unikt og romantisk frieri.', category: 'diverse', icon: <Heart className="w-5 h-5" /> },
{ id: 'personal-statement-generator', name: 'Personlig-uttalelse-generator', description: 'Lag overbevisende personlige uttalelser.', category: 'diverse', icon: <Edit className="w-5 h-5" /> },
{ id: 'retirement-wishes-generator', name: 'Pensjonsønsker-generator', description: 'Generer hjertelige pensjonsønsker.', category: 'diverse', icon: <Sunset className="w-5 h-5" /> },
{ id: 'resume-objectives-generator', name: 'CV-mål-generator', description: 'Lag klare og effektive karrieremål for din CV.', category: 'diverse', icon: <Target className="w-5 h-5" /> },
{ id: 'niche-ideas-generator', name: 'Nisje-idé-generator', description: 'Få inspirasjon til lukrative nisjeideer.', category: 'diverse', icon: <Search className="w-5 h-5" /> },
{ id: 'quote-generator', name: 'Sitat-generator', description: 'Generer inspirerende og tankefulle sitater.', category: 'diverse', icon: <Quote className="w-5 h-5" /> },
{ id: 'quote-meaning-generator', name: 'Sitatforklaring-generator', description: 'Få dypere innsikt i kjente sitater.', category: 'diverse', icon: <HelpCircle className="w-5 h-5" /> },
{ id: 'nonprofit-mission-statement-generator', name: 'Ideell-organisasjon-misjonsuttalelse-generator', description: 'Lag kraftfulle misjonsuttalelser for ideelle organisasjoner.', category: 'diverse', icon: <Heart className="w-5 h-5" /> },
{ id: 'podcast-name-generator', name: 'Podcast-navn-generator', description: 'Finn et catchy navn til din podcast.', category: 'diverse', icon: <Mic className="w-5 h-5" /> },
{ id: 'emoji-translator', name: 'Emoji-oversetter', description: 'Oversett tekst til emojis og omvendt.', category: 'diverse', icon: <Smile className="w-5 h-5" /> },
{ id: 'happy-birthday-generator', name: 'Bursdagshilsen-generator', description: 'Lag personlige og morsomme bursdagshilsener.', category: 'diverse', icon: <Gift className="w-5 h-5" /> },
{ id: 'rap-lyrics-generator', name: 'Rap-tekst-generator', description: 'Skap unike og fengende rap-tekster.', category: 'diverse', icon: <Mic className="w-5 h-5" /> },
{ id: 'greentext-ai-generator', name: 'Greentext-AI-generator', description: 'Lag engasjerende greentext-historier med AI.', category: 'diverse', icon: <FileText className="w-5 h-5" /> },
]

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [displayedTools, setDisplayedTools] = useState(tools)

  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('favoriteTools')
    if (storedFavorites) {
      const parsedFavorites = JSON.parse(storedFavorites)
      setFavorites(parsedFavorites)
      console.log('Loaded favorites:', parsedFavorites)
    }

    // Check if user is logged in (implement your actual login check here)
    setIsLoggedIn(true) // For demonstration purposes
  }, [])

  useEffect(() => {
    console.log('Effect triggered. Active category:', activeCategory)
    console.log('Current search term:', searchTerm)
    console.log('All tools:', tools.map(t => `${t.name} (${t.category})`))

    let filtered = tools.slice()

    if (activeCategory === 'favorites') {
      filtered = filtered.filter(tool => favorites.includes(tool.id))
      console.log('Filtered favorites:', filtered.map(t => `${t.name} (${t.category})`))
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === activeCategory)
      console.log('Filtered by category:', filtered.map(t => `${t.name} (${t.category})`))
    }

    if (searchTerm.trim() !== '') {
      const lowercaseSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(lowercaseSearchTerm) ||
        tool.description.toLowerCase().includes(lowercaseSearchTerm)
      )
      console.log('Filtered by search term:', filtered.map(t => `${t.name} (${t.category})`))
    }

    console.log('Final filtered tools:', filtered.map(t => `${t.name} (${t.category})`))
    setDisplayedTools(filtered)
  }, [activeCategory, searchTerm, favorites])

  const toggleFavorite = (toolId: string) => {
    if (!isLoggedIn) return

    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId]

    setFavorites(newFavorites)
    localStorage.setItem('favoriteTools', JSON.stringify(newFavorites))
    console.log('Toggled favorite:', toolId, 'New favorites:', newFavorites)
  }

  // Add 'Favoritter' to the categories array
  const categoriesWithFavorites = [
    { icon: <Star className="w-4 h-4" />, name: 'Favoritter', id: 'favorites' },
    ...categories
  ]

  const renderToolCard = (tool: any) => (
    <Link href={`/tools/${tool.id}`} key={tool.id} className="h-full relative" data-category={tool.category}>
      <Card className="h-full flex flex-col rounded-xl border bg-card text-card-foreground shadow hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 cursor-pointer">
        <CardHeader className="flex flex-row items-center space-x-2 p-4">
          <div className="text-[#06f] dark:text-blue-400">{tool.icon}</div>
          <h3 className="font-semibold text-[#06f] dark:text-blue-400 text-[0.9rem] leading-[1.2rem]">{tool.name}</h3>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-xs text-gray-600 dark:text-gray-300">{tool.description}</p>
        </CardContent>
      </Card>
      {isLoggedIn && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-400 hover:text-yellow-400"
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(tool.id)
          }}
        >
          <Star className={`h-4 w-4 ${favorites.includes(tool.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
      )}
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
            Beste AI-skriveverktøy
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Velg mellom 136 maler og gjør ideene dine til live med innhold av høy kvalitet.
          </p>
          <div className="mt-10 max-w-xl mx-auto">
            <Input
              type="search"
              placeholder="Søk etter et AI-skriveverktøy"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24"> {/* Added sticky positioning with top offset */}
              <nav className="space-y-2">
                {categoriesWithFavorites.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={`w-full justify-start ${activeCategory === category.id ? 'bg-gray-100 dark:bg-gray-800' : ''} text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                    <span className="ml-3">{category.name}</span>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {categoriesWithFavorites.find(cat => cat.id === activeCategory)?.name || 'Alle verktøy'}
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {displayedTools.map(renderToolCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}