import React, { useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link2 } from 'lucide-react';
import SolicitacaoCard from './SolicitacaoCard';
import toast from 'react-hot-toast';
import { listarSolicitacoes } from '../api';

const COLUNAS = [
  { id: 'Triagem',           label: 'Triagem',           cor: 'bg-gray-200',   header: 'bg-gray-400 text-white' },
  { id: 'Diagnostico',       label: 'Diagnóstico',       cor: 'bg-blue-50',    header: 'bg-blue-500 text-white' },
  { id: 'Agendamento',       label: 'Agendamento',       cor: 'bg-yellow-50',  header: 'bg-yellow-500 text-white' },
  { id: 'AguardandoCompras', label: 'Aguard. Compras',   cor: 'bg-orange-50',  header: 'bg-orange-500 text-white' },
  { id: 'Execucao',          label: 'Execução',          cor: 'bg-purple-50',  header: 'bg-purple-600 text-white' },
  { id: 'Concluido',         label: 'Concluído',         cor: 'bg-green-50',   header: 'bg-green-600 text-white' },
  { id: 'Cancelado',         label: 'Cancelado',         cor: 'bg-red-50',     header: 'bg-red-500 text-white' },
];

export default function KanbanBoard({ solicitacoes, setSolicitacoes, onAtualizar, onAbrirModal, usuario }) {
  const carregar = useCallback(async () => {
    try {
      const dados = await listarSolicitacoes();
      setSolicitacoes(dados);
    } catch {
      toast.error('Erro ao carregar solicitações');
    }
  }, [setSolicitacoes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const porFase = COLUNAS.reduce((acc, col) => {
    acc[col.id] = (solicitacoes || []).filter(s => s.fase_atual === col.id);
    return acc;
  }, {});

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const novaFase = destination.droppableId;
    try {
      await onAtualizar(draggableId, { fase_atual: novaFase });
    } catch {
      toast.error('Erro ao mover solicitação');
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 p-4 overflow-x-auto h-full min-h-0">
        {COLUNAS.map(col => (
          <div key={col.id} className="flex-shrink-0 w-60 flex flex-col">
            <div className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${col.header}`}>
              <div className="flex items-center gap-1.5">
                {col.id === 'AguardandoCompras' && <Link2 size={13} />}
                <span className="text-sm font-semibold">{col.label}</span>
              </div>
              <span className="text-xs bg-white/25 rounded-full px-2 py-0.5 font-bold">
                {porFase[col.id].length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-b-lg p-2 flex flex-col gap-2 min-h-[120px] transition-colors ${col.cor} ${snapshot.isDraggingOver ? 'ring-2 ring-purple-400' : ''}`}
                >
                  {porFase[col.id].map((sol, index) => (
                    <Draggable key={sol.id} draggableId={sol.id} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={snap.isDragging ? 'opacity-75' : ''}
                        >
                          <SolicitacaoCard
                            solicitacao={sol}
                            onClick={() => onAbrirModal(sol)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
