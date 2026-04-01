/**
 * useCommandPolling
 * =================
 * Background hook that polls the LocQar API for pending door commands,
 * executes them via the local door-controller (RS-485), and acks back.
 *
 * Usage:
 *   const { lastCommand, isPolling, error } = useCommandPolling()
 *
 * The hook starts polling automatically on mount and stops on unmount.
 * When a command is received and executed, `lastCommand` updates so the
 * UI can react (e.g. show door-open animation on a specific door).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { pollCommands, ackCommand, openDoorLocal } from '../services/api'
import { getConfig } from '../services/config'

const POLL_INTERVAL_MS = 2500 // 2.5 seconds

export default function useCommandPolling({ onDoorOpen } = {}) {
  const [isPolling, setIsPolling] = useState(true)
  const [lastCommand, setLastCommand] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const processingRef = useRef(false) // Prevent overlapping poll cycles

  /**
   * Process a single command:
   *  1. Call local door controller to physically open the door
   *  2. Ack back to the API with success/failure
   *  3. Notify the UI via onDoorOpen callback
   */
  const processCommand = useCallback(async (cmd) => {
    console.log(`[CommandPolling] Processing command: ${cmd.id} → open door #${cmd.doorNum}`)

    let success = false
    let errorMsg = null

    try {
      // Call local door-controller (RS-485 bridge at localhost:9090)
      await openDoorLocal(cmd.doorNum)
      success = true
      console.log(`[CommandPolling] Door #${cmd.doorNum} opened successfully`)
    } catch (err) {
      errorMsg = err.message || 'Failed to open door'
      console.error(`[CommandPolling] Door #${cmd.doorNum} failed:`, errorMsg)
    }

    // Ack back to the API
    try {
      await ackCommand(cmd.id, success, errorMsg)
      console.log(`[CommandPolling] Acked command ${cmd.id}: ${success ? 'completed' : 'failed'}`)
    } catch (ackErr) {
      console.error(`[CommandPolling] Failed to ack command ${cmd.id}:`, ackErr.message)
    }

    // Notify UI
    const result = { ...cmd, success, error: errorMsg }
    setLastCommand(result)
    onDoorOpen?.(result)

    return result
  }, [onDoorOpen])

  /**
   * Single poll cycle: fetch pending commands and process each.
   */
  const doPoll = useCallback(async () => {
    if (processingRef.current) return // Skip if previous cycle still running
    processingRef.current = true

    try {
      const commands = await pollCommands(getConfig().lockerSN)

      if (commands.length > 0) {
        console.log(`[CommandPolling] Received ${commands.length} command(s)`)
        for (const cmd of commands) {
          if (cmd.type === 'open-door') {
            await processCommand(cmd)
          } else {
            console.warn(`[CommandPolling] Unknown command type: ${cmd.type}`)
            await ackCommand(cmd.id, false, `Unsupported command type: ${cmd.type}`)
          }
        }
      }

      setError(null)
    } catch (err) {
      // Network errors, API down, etc. — log but keep polling
      console.error('[CommandPolling] Poll error:', err.message)
      setError(err.message)
    } finally {
      processingRef.current = false
    }
  }, [processCommand])

  // Start/stop polling
  useEffect(() => {
    if (!isPolling) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // Initial poll immediately
    doPoll()

    // Then poll on interval
    intervalRef.current = setInterval(doPoll, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPolling, doPoll])

  return {
    lastCommand,
    isPolling,
    error,
    setIsPolling,
  }
}
