'use client'

import React, { useState, useEffect } from 'react'
import { X, FileText, Settings, ChevronDownIcon, InfoIcon, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from '@/lib/supabase'
import { useSession } from "next-auth/react"
import Upgrade from '@/components/Upgrade'

// Add this interface for CustomSelect props
interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}

// Add this CustomSelect component
const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, placeholder, disabled }) => (
  <div className="mb-4">
    <Label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</Label>
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-800">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

interface RadioOption {
  value: string;
  label: string;
  description: string;
}

// Add this interface for ExtraOption props
interface ExtraOptionProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

// Add this ExtraOption component
const ExtraOption: React.FC<ExtraOptionProps> = ({ id, label, checked, onChange, tooltip, disabled = false, children }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <Switch
                id={id}
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
              />
              <label
                htmlFor={id}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {label}
              </label>
              <InfoIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {children}
  </div>
)

export default function WritePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [prompt, setPrompt] = useState('')
  const [promptQuality, setPromptQuality] = useState('')
  const [hasTyped, setHasTyped] = useState(false)
  const [outlineType, setOutlineType] = useState('no-outline')
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [articleType, setArticleType] = useState('Standard artikkel')
  const [tone, setTone] = useState('')
  const [length, setLength] = useState('')
  const [language, setLanguage] = useState('Norsk')
  const [description, setDescription] = useState('')
  const [includeSources, setIncludeSources] = useState(false)
  const [enableWebSearch, setEnableWebSearch] = useState(false)
  const [numberOfSources, setNumberOfSources] = useState<number>(1)
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null)
  const [useLocalLinks, setUseLocalLinks] = useState(false)
  const [selectedSitemap, setSelectedSitemap] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [projectFolders, setProjectFolders] = useState<{ id: number; name: string }[]>([])
  const [snippets, setSnippets] = useState<{ snippet_id: string; title: string }[]>([])
  const [sitemaps, setSitemaps] = useState<{ id: number; url: string }[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [academicLevel, setAcademicLevel] = useState('')
  const [vocationalProgram, setVocationalProgram] = useState('')
  const [subject, setSubject] = useState('')  // Add this line
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSidePanelMinimized, setIsSidePanelMinimized] = useState(false)
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [wordCount, setWordCount] = useState<number>(1500)
  const [isWordCountValid, setIsWordCountValid] = useState(true)

  const radioOptions: RadioOption[] = [
    { value: 'no-outline', label: 'Blanke ark', description: 'Start med et tomt dokument' },
    { value: 'standard', label: 'Standard overskrifter', description: 'Legg til standard overskrifter (Introduksjon, Metoder, Resultater osv.)' },
    { value: 'creative', label: 'Kreative overskrifter', description: 'AI vil generere overskrifter basert på din dokumentoppgave' },
  ]

  useEffect(() => {
    if (prompt.length > 0) {
      setHasTyped(true)
      if (prompt.length < 20) {
        setPromptQuality('poor')
      } else if (prompt.length < 50) {
        setPromptQuality('medium')
      } else {
        setPromptQuality('good')
      }
    } else {
      setHasTyped(false)
      setPromptQuality('')
    }
  }, [prompt])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setUserEmail(session.user.email)
      fetchSitemaps(session.user.email)
      fetchProjectFolders(session.user.email)
    }
  }, [status, session])

  useEffect(() => {
    // Check if the form is valid (prompt is not empty and an outline type is selected)
    setIsFormValid(prompt.trim() !== '' && outlineType !== '')
  }, [prompt, outlineType])

  const fetchSitemaps = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('sitemaps')
        .select('id, url')
        .eq('user_email', email)
        .order('url', { ascending: true })

      if (error) {
        console.error('Error fetching sitemaps:', error)
      } else {
        setSitemaps(data || [])
      }
    } catch (error) {
      console.error('Error in fetchSitemaps:', error)
    }
  }

  const fetchProjectFolders = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('project_folders')
        .select('id, name')
        .eq('user_email', email)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching project folders:', error)
      } else {
        setProjectFolders(data || [])
      }
    } catch (error) {
      console.error('Error in fetchProjectFolders:', error)
    }
  }

  const getPromptQualityColor = () => {
    switch (promptQuality) {
      case 'poor':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'good':
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getPromptQualityWidth = () => {
    switch (promptQuality) {
      case 'poor':
        return 'w-1/4'
      case 'medium':
        return 'w-1/2'
      case 'good':
        return 'w-full'
      default:
        return 'w-0'
    }
  }

  const renderArticleTypeFields = () => {
    switch (articleType) {
      case 'Studentoppgave':
        return (
          <>
            {/* Existing Studentoppgave fields */}
            <Label htmlFor="subject" className="text-gray-900 dark:text-white">Fag</Label>
            <Input 
              id="subject" 
              placeholder="F.eks. Historie, Matematikk, etc." 
              className="mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Label htmlFor="academicLevel" className="text-gray-900 dark:text-white">Akademisk nivå</Label>
            <div className="relative">
              <Select onValueChange={setAcademicLevel} value={academicLevel}>
                <SelectTrigger id="academicLevel" className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Velg akademisk nivå" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 z-[9999]">
                  <SelectItem value="Ungdomsskolen">Ungdomsskolen</SelectItem>
                  <SelectItem value="Videregående">Videregående</SelectItem>
                  <SelectItem value="Høyskole/Bachelor">Høyskole/Bachelor</SelectItem>
                  <SelectItem value="Høyskole/Mastergrad">Høyskole/Mastergrad</SelectItem>
                  <SelectItem value="Høyskole/Ph.D">Høyskole/Ph.D</SelectItem>
                  <SelectItem value="Yrkesfaglige utdanningsprogram">Yrkesfaglige utdanningsprogram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {academicLevel === 'Yrkesfaglige utdanningsprogram' && (
              <>
                <Label htmlFor="vocationalProgram" className="text-gray-900 dark:text-white">Yrkesfaglig program</Label>
                <div className="relative">
                  <Select onValueChange={setVocationalProgram} value={vocationalProgram}>
                    <SelectTrigger id="vocationalProgram" className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Velg yrkesfaglig program" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 z-[9999]">
                      <SelectItem value="Bygg- og anleggsteknikk">Bygg- og anleggsteknikk</SelectItem>
                      <SelectItem value="Design og håndverk">Design og håndverk</SelectItem>
                      <SelectItem value="Elektrofag">Elektrofag</SelectItem>
                      <SelectItem value="Helse- og oppvekstfag">Helse- og oppvekstfag</SelectItem>
                      <SelectItem value="Naturbruk">Naturbruk</SelectItem>
                      <SelectItem value="Restaurant- og matfag">Restaurant- og matfag</SelectItem>
                      <SelectItem value="Service og samferdsel">Service og samferdsel</SelectItem>
                      <SelectItem value="Teknikk og industriell produksjon">Teknikk og industriell produksjon</SelectItem>
                      <SelectItem value="Informasjonsteknologi og medieproduksjon (yrkesfaglig)">Informasjonsteknologi og medieproduksjon (yrkesfaglig)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {/* Add Antall ord input for Studentoppgave */}
            <div className="flex items-center space-x-2 mt-4">
              <Label htmlFor="wordCount" className="text-gray-900 dark:text-white">Antall ord</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-[200px]">
                    <p>Du kan generere opptil 12,288 ord i én omgang. Du kan utvide artikkelen etter at den er generert.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              id="wordCount" 
              type="number" 
              placeholder="F.eks. 1000" 
              className={`mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${!isWordCountValid ? 'border-red-500' : ''}`}
              value={wordCount || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Math.min(parseInt(e.target.value), 12288);
                setWordCount(value);
                setIsWordCountValid(value > 0 && value <= 12288);
              }}
              onBlur={() => {
                if (wordCount > 12288) {
                  setWordCount(12288);
                  setIsWordCountValid(true);
                } else if (wordCount < 1) {
                  setWordCount(1);
                  setIsWordCountValid(true);
                }
              }}
            />
            {!isWordCountValid && (
              <p className="text-red-500 text-sm mt-1">Antall ord må være mellom 1 og 12,288.</p>
            )}
          </>
        )
      case 'SEO-artikkel':
        return (
          <>
            <Label htmlFor="project" className="text-gray-900 dark:text-white">Prosjekt</Label>
            <Select onValueChange={setSelectedProject} value={selectedProject}>
              <SelectTrigger className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Velg prosjekt (valgfritt)" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
                {projectFolders.length > 0 ? (
                  projectFolders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id.toString()} className="text-gray-900 dark:text-gray-100">
                      {folder.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_projects" className="text-gray-900 dark:text-gray-100">Ingen prosjekter</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Label htmlFor="tone" className="text-gray-900 dark:text-white">Tone</Label>
            <Select onValueChange={setTone} value={tone}>
              <SelectTrigger className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Velg tone" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
                <SelectItem value="formal" className="text-gray-900 dark:text-gray-100">Formell</SelectItem>
                <SelectItem value="casual" className="text-gray-900 dark:text-gray-100">Uformell</SelectItem>
                <SelectItem value="humorous" className="text-gray-900 dark:text-gray-100">Humoristisk</SelectItem>
                <SelectItem value="serious" className="text-gray-900 dark:text-gray-100">Seriøs</SelectItem>
                <SelectItem value="optimistic" className="text-gray-900 dark:text-gray-100">Optimistisk</SelectItem>
              </SelectContent>
            </Select>
            
            <Label htmlFor="length" className="text-gray-900 dark:text-white">Artikkel lengde</Label>
            <Select onValueChange={setLength} value={length}>
              <SelectTrigger className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Velg artikkel lengde" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
                <SelectItem value="Kortere (2-3 Seksjoner, 450-900 Ord)" className="text-gray-900 dark:text-gray-100">Kortere (2-3 Seksjoner, 450-900 Ord)</SelectItem>
                <SelectItem value="Kort (3-5 Seksjoner, 950-1350 Ord)" className="text-gray-900 dark:text-gray-100">Kort (3-5 Seksjoner, 950-1350 Ord)</SelectItem>
                <SelectItem value="Middels (5-7 Seksjoner, 1350-1870 Ord)" className="text-gray-900 dark:text-gray-100">Middels (5-7 Seksjoner, 1350-1870 Ord)</SelectItem>
                <SelectItem value="Lang Form (7-10 Seksjoner, 1900-2440 Ord)" className="text-gray-900 dark:text-gray-100">Lang Form (7-10 Seksjoner, 1900-2440 Ord)</SelectItem>
                <SelectItem value="Lengre (10-12 Seksjoner, 2350-2940 Ord)" className="text-gray-900 dark:text-gray-100">Lengre (10-12 Seksjoner, 2350-2940 Ord)</SelectItem>
              </SelectContent>
            </Select>
            
            <Label htmlFor="language" className="text-gray-900 dark:text-white">Språk</Label>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Velg språk" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
                <SelectItem value="Norsk" className="text-gray-900 dark:text-gray-100">Norsk</SelectItem>
                <SelectItem value="Svensk" className="text-gray-900 dark:text-gray-100">Svensk</SelectItem>
                <SelectItem value="Dansk" className="text-gray-900 dark:text-gray-100">Dansk</SelectItem>
              </SelectContent>
            </Select>
            
            <Label htmlFor="description" className="text-gray-900 dark:text-white">Artikkelbeskrivelse</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv hva artikkelen vil handle om"
              rows={4}
              className="mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            />
            
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Ekstra alternativer</h3>
            <ExtraOption
              id="include-sources"
              label="Inkluder kilder"
              checked={includeSources}
              onChange={handleIncludeSourcesChange}
              tooltip="Legg til kildehenvisninger for å støtte påstander og gi kredibilitet til artikkelen."
            >
              {includeSources && (
                <div className="flex items-center ml-4">
                  <label htmlFor="number-of-sources" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                    Antall kilder:
                  </label>
                  <Input
                    id="number-of-sources"
                    type="number"
                    min="1"
                    max="5"
                    value={numberOfSources}
                    onChange={handleNumberOfSourcesChange}
                    className="w-16 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </ExtraOption>
            <ExtraOption
              id="enable-web-search"
              label="Aktiver websøk"
              checked={enableWebSearch}
              onChange={setEnableWebSearch}
              tooltip="Tillat AI-en å søke på nettet for oppdatert og relevant informasjon til artikkelen."
              disabled={includeSources}
            />
            
            <Label htmlFor="snippet" className="block mt-4 mb-2 text-gray-900 dark:text-white">Kapsler</Label>
            <Select onValueChange={setSelectedSnippet} value={selectedSnippet || undefined}>
              <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Velg en kapsel" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
                {snippets.length > 0 ? (
                  snippets.map((snippet) => (
                    <SelectItem key={snippet.snippet_id} value={snippet.snippet_id} className="text-gray-900 dark:text-gray-100">
                      {snippet.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_snippets" className="text-gray-900 dark:text-gray-100">Du har ingen kapsler</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="use-local-links"
                checked={useLocalLinks}
                onCheckedChange={setUseLocalLinks}
              />
              <Label htmlFor="use-local-links" className="text-sm font-medium text-gray-900 dark:text-white">
                Bruk lokale lenker
              </Label>
            </div>
            
            <Label htmlFor="sitemap" className="text-gray-900 dark:text-white">Sitemap</Label>
            <Select onValueChange={setSelectedSitemap} value={selectedSitemap || ''} disabled={!useLocalLinks}>
              <SelectTrigger className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Velg sitemap" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
                {sitemaps.length > 0 ? (
                  sitemaps.map(sitemap => (
                    <SelectItem key={sitemap.id} value={sitemap.id.toString()} className="text-gray-900 dark:text-gray-100">
                      {sitemap.url}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_sitemaps" className="text-gray-900 dark:text-gray-100">Ingen sitemaps</SelectItem>
                )}
              </SelectContent>
            </Select>
          </>
        )
      case 'Standard artikkel':
        return (
          <>
            <div className="flex items-center space-x-2">
              <Label htmlFor="wordCount" className="text-gray-900 dark:text-white">Antall ord</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-[200px]">
                    <p>Du kan generere opptil 12,288 ord i én omgang. Du kan utvide artikkelen etter at den er generert.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              id="wordCount" 
              type="number" 
              placeholder="F.eks. 1000" 
              className={`mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${!isWordCountValid ? 'border-red-500' : ''}`}
              value={wordCount || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Math.min(parseInt(e.target.value), 12288);
                setWordCount(value);
                setIsWordCountValid(value > 0 && value <= 12288);
              }}
              onBlur={() => {
                if (wordCount > 12288) {
                  setWordCount(12288);
                  setIsWordCountValid(true);
                } else if (wordCount < 1) {
                  setWordCount(1);
                  setIsWordCountValid(true);
                }
              }}
            />
            {!isWordCountValid && (
              <p className="text-red-500 text-sm mt-1">Antall ord må være mellom 1 og 12,288.</p>
            )}
          </>
        )
      default:
        return null
    }
  }

  const handleIncludeSourcesChange = (checked: boolean) => {
    setIncludeSources(checked)
    if (checked) {
      setEnableWebSearch(true)
    } else {
      setNumberOfSources(1)
    }
  }

  const handleNumberOfSourcesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= 5) {
      setNumberOfSources(value)
    }
  }

  const handleMinimizeChange = (isMinimized: boolean) => {
    setIsSidePanelMinimized(isMinimized)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setIsLoading(true);
    const id = uuidv4();
    
    try {
      let formData: any = {
        id,
        prompt,
        outline_type: outlineType,
        article_type: articleType,
      };

      // Add fields specific to each article type
      if (articleType === 'SEO-artikkel') {
        formData = {
          ...formData,
          project_id: selectedProject,
          description,
          tone,
          length,
          language,
          include_sources: includeSources,
          number_of_sources: numberOfSources,
          selected_snippet: selectedSnippet,
          use_local_links: useLocalLinks,
          sitemap_id: selectedSitemap,
        };
      } else if (articleType === 'Studentoppgave') {
        formData = {
          ...formData,
          academic_level: academicLevel,
          vocational_program: vocationalProgram,
          subject,
          length: wordCount.toString(), // Add this line
        };
      } else if (articleType === 'Standard artikkel') {
        formData.length = wordCount.toString();
      }

      console.log('Form data before submission:', formData);

      const response = await fetch('/api/store-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to store prompt: ${JSON.stringify(errorData)}`);
      }
      
      // Navigate to the editor page with a query parameter to start generation
      router.push(`/write/${id}${outlineType !== 'no-outline' ? '?generate=true' : ''}`);
    } catch (error) {
      console.error('Error processing form:', error);
      setIsLoading(false);
      alert(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to stop event propagation
  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className={`w-full bg-gray-100 dark:bg-gray-900 ${showAdvancedSettings ? 'overflow-hidden' : ''}`}>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full relative z-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
                <span className="mr-2 text-2xl">👋</span> Hva skriver du i dag?
              </h2>
            </div>
            <div className="relative mb-4">
              <Input
                placeholder="f.eks. en oppgave om global oppvarming"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-2 h-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                required // Add this line to make the field required
              />
              {hasTyped && (
                <>
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${getPromptQualityColor()} ${getPromptQualityWidth()} transition-all duration-300 ease-in-out`}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {promptQuality === 'poor' && 'Svak tittel: legg til flere detaljer for å forbedre kvaliteten'}
                    {promptQuality === 'medium' && 'Middels tittel: god start, men kan bruke mer kontekst'}
                    {promptQuality === 'good' && 'Sterk oppgave: bra jobbet! Dette bør generere innhold av høy kvalitet'}
                  </p>
                </>
              )}
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Generer disposisjon</h3>
            <div className="space-y-2">
              {radioOptions.map((option, index) => (
                <div 
                  key={option.value}
                  className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${outlineType === option.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'}`}
                  onClick={() => setOutlineType(option.value)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option.value}
                      name="outlineType"
                      value={option.value}
                      checked={outlineType === option.value}
                      onChange={() => setOutlineType(option.value)}
                      className="sr-only" // Hide the default radio button
                      required // Add this line to make selecting an option required
                    />
                    <div className={`w-4 h-4 rounded-full border-2 ${outlineType === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    {index === 0 && (
                      <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="35" height="39" rx="3.5" fill="white"></rect>
                        <rect x="0.5" y="0.5" width="35" height="39" rx="3.5" stroke="#E4E4E7"></rect>
                        <rect x="6" y="8" width="24" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect opacity="0.1" x="6" y="15.1429" width="20" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect opacity="0.1" x="6" y="22.2857" width="24" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect opacity="0.1" x="6" y="29.4286" width="16" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                      </svg>
                    )}
                    {index === 1 && (
                      <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="35" height="39" rx="3.5" fill="white"></rect>
                        <rect x="0.5" y="0.5" width="35" height="39" rx="3.5" stroke="#E4E4E7"></rect>
                        <rect x="6" y="8" width="24" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect x="6" y="15.1429" width="20" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect x="6" y="22.2857" width="24" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect x="6" y="29.4286" width="16" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                      </svg>
                    )}
                    {index === 2 && (
                      <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="35" height="39" rx="3.5" fill="white"></rect>
                        <rect x="0.5" y="0.5" width="35" height="39" rx="3.5" stroke="#E4E4E7"></rect>
                        <rect x="6" y="8" width="12" height="3" rx="0.8" fill="#A1A1AA"></rect>
                        <rect x="6" y="15.2857" width="16" height="3" rx="0.8" fill="#A1A1AA"></rect>
                        <rect x="6" y="22.5714" width="24" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <rect x="6" y="29.7143" width="19.2857" height="2.85714" rx="0.8" fill="#A1A1AA"></rect>
                        <path fillRule="evenodd" clipRule="evenodd" d="M25.8237 8.1664C25.472 8.5369 25.4871 9.12235 25.8576 9.4741L30.1363 13.5365C30.5068 13.8882 31.0923 13.873 31.444 13.5026C31.7958 13.1321 31.7806 12.5466 31.4101 12.1949L27.1314 8.1325C26.7609 7.78073 26.1754 7.79592 25.8237 8.1664ZM26.374 8.9302C26.3039 8.86365 26.301 8.7529 26.3676 8.6828C26.4341 8.6127 26.5449 8.60985 26.615 8.6764L28.1524 10.1361L27.9115 10.3899L26.374 8.9302Z" fill="#A1A1AA"></path>
                        <path d="M28.8552 4.03801C28.895 3.89 29.105 3.89 29.1449 4.03801L29.5079 5.38634C29.5218 5.43796 29.5621 5.47828 29.6137 5.49218L30.9621 5.85522C31.1101 5.89507 31.1101 6.10505 30.9621 6.1449L29.6137 6.50793C29.5621 6.52183 29.5218 6.56216 29.5079 6.61378L29.1449 7.96211C29.105 8.11011 28.895 8.11011 28.8552 7.96211L28.4921 6.61378C28.4782 6.56216 28.4379 6.52183 28.3863 6.50793L27.038 6.1449C26.89 6.10505 26.89 5.89507 27.038 5.85522L28.3863 5.49218C28.4379 5.47828 28.4782 5.43796 28.4921 5.38634L28.8552 4.03801Z" fill="#A1A1AA"></path>
                        <path d="M23.5827 4.86146C23.6095 4.762 23.7506 4.762 23.7774 4.86146L24.0213 5.76754C24.0307 5.80223 24.0578 5.82932 24.0924 5.83866L24.9985 6.08262C25.098 6.1094 25.098 6.25051 24.9985 6.27729L24.0924 6.52125C24.0578 6.53059 24.0307 6.55769 24.0213 6.59238L23.7774 7.49846C23.7506 7.59791 23.6095 7.59791 23.5827 7.49846L23.3387 6.59238C23.3294 6.55769 23.3023 6.53059 23.2676 6.52125L22.3615 6.27729C22.2621 6.25051 22.2621 6.1094 22.3615 6.08262L23.2676 5.83866C23.3023 5.82932 23.3294 5.80223 23.3387 5.76754L23.5827 4.86146Z" fill="#A1A1AA"></path>
                        <path d="M23.9783 9.95191C24.0118 9.82756 24.1882 9.82756 24.2217 9.95191L24.5266 11.0845C24.5383 11.1279 24.5722 11.1617 24.6155 11.1734L25.7481 11.4784C25.8725 11.5118 25.8725 11.6882 25.7481 11.7217L24.6155 12.0266C24.5722 12.0383 24.5383 12.0722 24.5266 12.1156L24.2217 13.2481C24.1882 13.3725 24.0118 13.3725 23.9783 13.2481L23.6734 12.1156C23.6617 12.0722 23.6278 12.0383 23.5845 12.0266L22.4519 11.7217C22.3276 11.6882 22.3276 11.5118 22.4519 11.4784L23.5845 11.1734C23.6278 11.1617 23.6617 11.1279 23.6734 11.0845L23.9783 9.95191Z" fill="#A1A1AA"></path>
                      </svg>
                    )}
                  </div>
                  <Label className="flex-grow cursor-pointer pl-2.5">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{option.label}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                  </Label>
                </div>
              ))}
            </div>
            
            <Button 
              type="button" 
              variant="link" 
              className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-0"
              onClick={() => setShowAdvancedSettings(true)}
            >
              Avanserte instillinger
            </Button>
            
            <button
              type="submit"
              className={`w-full mt-4 bg-[#146ef5] text-white font-bold py-4 px-6 rounded transition duration-300 ease-in-out flex items-center justify-center space-x-2 shadow-[0_4px_4px_#08080814,0_1px_2px_#08080833,inset_0_6px_12px_#ffffff1f,inset_0_1px_1px_#fff3] ${
                isFormValid
                  ? 'hover:bg-[#0055d4] hover:shadow-[0_1px_1px_#08080814,0_1px_1px_#08080833,inset_0_6px_12px_#ffffff1f,inset_0_1px_1px_#fff3]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!isFormValid || isLoading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Genererer...</span>
                </>
              ) : (
                <span>Skriv</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Overlay */}
      {showAdvancedSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={() => setShowAdvancedSettings(false)}
        ></div>
      )}

      {/* Advanced Settings Side Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-[9999] ${
          showAdvancedSettings ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
        onClick={handlePanelClick}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400"
          onClick={() => setShowAdvancedSettings(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Avanserte instillinger</h2>
        
        <div className="space-y-4">
          <Label htmlFor="articleType" className="block mb-2 text-gray-900 dark:text-white">Artikkeltype</Label>
          <Select onValueChange={setArticleType} value={articleType}>
            <SelectTrigger className="w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Velg artikkeltype" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 z-[10000]" position="popper" sideOffset={5}>
              <SelectItem value="Standard artikkel" className="text-gray-900 dark:text-gray-100">Standard artikkel</SelectItem>
              <SelectItem value="Studentoppgave" className="text-gray-900 dark:text-gray-100">Studentoppgave</SelectItem>
              <SelectItem value="SEO-artikkel" className="text-gray-900 dark:text-gray-100">SEO-artikkel</SelectItem>
            </SelectContent>
          </Select>

          {renderArticleTypeFields()}
        </div>
      </div>

      <Upgrade isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} isSidePanelMinimized={isSidePanelMinimized} />
    </div>
  )
}