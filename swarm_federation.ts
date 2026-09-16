import express, { Request, Response } from 'express';
import axios from 'axios';

interface PeerNode {
  id: string;
  url: string;
  capabilities: string[];
  lastSeen: number;
}

export class SwarmFederator {
  private peers: Map<string, PeerNode> = new Map();
  private nodeId: string;
  private nodeUrl: string;

  constructor(nodeId: string, nodeUrl: string) {
    this.nodeId = nodeId;
    this.nodeUrl = nodeUrl;
  }

  // Register a peer node into the swarm mesh
  public registerPeer(peer: PeerNode): void {
    this.peers.set(peer.id, { ...peer, lastSeen: Date.now() });
    console.log(`[SWARM] Peer registered/updated: ${peer.id} at 
${peer.url}`);
  }

  // Broadcast presence to a bootstrap or registry node
  public async pingRegistry(registryUrl: string): Promise<void> {
    try {
      const payload = {
        id: this.nodeId,
        url: this.nodeUrl,
        capabilities: ['arbitrage', 'telemetry', 'a2a-messaging'],
        timestamp: Date.now()
      };
      await axios.post(`${registryUrl}/api/warp/federation/ping`, 
payload);
      console.log(`[SWARM] Successfully broadcast presence to registry: 
${registryUrl}`);
    } catch (error: any) {
      console.error(`[SWARM] Failed to ping registry: ${error.message}`);
    }
  }

  // Retrieve active peer list
  public getActivePeers(): PeerNode[] {
    return Array.from(this.peers.values());
  }
}
