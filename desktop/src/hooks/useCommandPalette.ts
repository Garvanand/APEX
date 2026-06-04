import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { PaletteCommand } from '../types';

// ─────────────────────────────────────────────────────────────
// useCommandPalette — Raycast-style ⌘K command launcher
// ─────────────────────────────────────────────────────────────

export interface UseCommandPaletteReturn {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  query: string;
  setQuery: (query: string) => void;
  filteredCommands: PaletteCommand[];
  allCommands: PaletteCommand[];
  registerCommands: (commands: PaletteCommand[]) => void;
  executeCommand: (id: string) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  moveSelection: (direction: 'up' | 'down') => void;
  executeSelected: () => void;
}

/**
 * Case-insensitive substring match across label, category, and keywords.
 */
function matchesQuery(command: PaletteCommand, query: string): boolean {
  const q = query.toLowerCase();
  if (command.label.toLowerCase().includes(q)) return true;
  if (command.category.toLowerCase().includes(q)) return true;
  if (command.keywords?.some(kw => kw.toLowerCase().includes(q))) return true;
  return false;
}

export function useCommandPalette(): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<PaletteCommand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Track latest commands ref so keyboard handler doesn't go stale
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  // ── Open / Close / Toggle ─────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        // Opening — reset state
        setQuery('');
        setSelectedIndex(0);
      }
      return !prev;
    });
  }, []);

  // ── Filtering ─────────────────────────────────────────────
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter(cmd => matchesQuery(cmd, query));
  }, [commands, query]);

  // Reset selected index when filter results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // ── Command registration ──────────────────────────────────
  const registerCommands = useCallback((newCommands: PaletteCommand[]) => {
    setCommands(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const merged = [...prev];
      for (const cmd of newCommands) {
        if (existingIds.has(cmd.id)) {
          // Replace existing command with same id
          const idx = merged.findIndex(c => c.id === cmd.id);
          if (idx !== -1) merged[idx] = cmd;
        } else {
          merged.push(cmd);
        }
      }
      return merged;
    });
  }, []);

  // ── Execution ─────────────────────────────────────────────
  const executeCommand = useCallback(
    (id: string) => {
      const cmd = commandsRef.current.find(c => c.id === id);
      if (cmd) {
        cmd.action();
        close();
      }
    },
    [close],
  );

  const moveSelection = useCallback(
    (direction: 'up' | 'down') => {
      setSelectedIndex(prev => {
        const max = filteredCommands.length - 1;
        if (max < 0) return 0;
        if (direction === 'down') return prev >= max ? 0 : prev + 1;
        return prev <= 0 ? max : prev - 1;
      });
    },
    [filteredCommands.length],
  );

  const executeSelected = useCallback(() => {
    const cmd = filteredCommands[selectedIndex];
    if (cmd) {
      cmd.action();
      close();
    }
  }, [filteredCommands, selectedIndex, close]);

  // ── Global keyboard shortcut (Ctrl+K / Cmd+K) ────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
        return;
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle, close, isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
    query,
    setQuery,
    filteredCommands,
    allCommands: commands,
    registerCommands,
    executeCommand,
    selectedIndex,
    setSelectedIndex,
    moveSelection,
    executeSelected,
  };
}
