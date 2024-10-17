import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import Modeler from 'camunda-bpmn-js/lib/camunda-cloud/Modeler'; // Zeebe Modeler pentru Camunda 8

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe.json';

import ConnectorsExtensionModule from 'bpmn-js-connectors-extension';

import ElementTemplateIconRenderer from '@bpmn-io/element-template-icon-renderer';
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule // Folosit pentru Camunda 8
} from 'bpmn-js-properties-panel';

import './styles.css';
import {HttpClient} from "@angular/common/http";
import {CreateAppendAnythingModule, CreateAppendElementTemplatesModule} from "bpmn-js-create-append-anything";

@Component({
  selector: 'app-bpmn-modeler',
  templateUrl: './bpmn-modeler.component.html',
  standalone: true,
  styleUrls: ['./bpmn-modeler.component.css']
})
export class BpmnModelerComponent implements AfterViewInit {
  private modeler!: Modeler;
  @ViewChild("container")
  private container! : ElementRef;

  private diagramXml: string = ` <?xml version="1.0" encoding="UTF-8"?>
     <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_02r90y2" targetNamespace="http://bpmn.io/schema/bpmn">
       <bpmn:process id="Process_1s5zn7v" isExecutable="true">
         <bpmn:startEvent id="StartEvent_1">
           <bpmn:outgoing>Flow_1e64c8b</bpmn:outgoing>
         </bpmn:startEvent>
         <bpmn:endEvent id="Event_0rzkx5b">
           <bpmn:incoming>Flow_1b80get</bpmn:incoming>
         </bpmn:endEvent>
         <bpmn:sequenceFlow id="Flow_1e64c8b" sourceRef="StartEvent_1" targetRef="Activity_1jlibrg" />
         <bpmn:sequenceFlow id="Flow_1b80get" sourceRef="Activity_1jlibrg" targetRef="Event_0rzkx5b" />
         <bpmn:userTask id="Activity_1jlibrg" name="A user task here">
           <bpmn:incoming>Flow_1e64c8b</bpmn:incoming>
           <bpmn:outgoing>Flow_1b80get</bpmn:outgoing>
         </bpmn:userTask>
       </bpmn:process>
       <bpmndi:BPMNDiagram id="BPMNDiagram_1">
         <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1s5zn7v">
           <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
             <dc:Bounds x="179" y="102" width="36" height="36" />
           </bpmndi:BPMNShape>
           <bpmndi:BPMNShape id="Event_0rzkx5b_di" bpmnElement="Event_0rzkx5b">
             <dc:Bounds x="812" y="102" width="36" height="36" />
           </bpmndi:BPMNShape>
           <bpmndi:BPMNShape id="Activity_0h5dmju_di" bpmnElement="Activity_1jlibrg">
             <dc:Bounds x="390" y="80" width="100" height="80" />
             <bpmndi:BPMNLabel />
           </bpmndi:BPMNShape>
           <bpmndi:BPMNEdge id="Flow_1e64c8b_di" bpmnElement="Flow_1e64c8b">
             <di:waypoint x="215" y="120" />
             <di:waypoint x="390" y="120" />
           </bpmndi:BPMNEdge>
           <bpmndi:BPMNEdge id="Flow_1b80get_di" bpmnElement="Flow_1b80get">
             <di:waypoint x="490" y="120" />
             <di:waypoint x="812" y="120" />
           </bpmndi:BPMNEdge>
         </bpmndi:BPMNPlane>
       </bpmndi:BPMNDiagram>
     </bpmn:definitions>
  `;

  constructor(private http : HttpClient) {
  }

  ngAfterViewInit(): void {
    if (this.modeler) {
      this.modeler.destroy();
    }
    const container = this.container.nativeElement;

    this.modeler = new Modeler({
      container,
      keyboard: {
        bindTo: document
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule,  // Modificat pentru Zeebe
        ConnectorsExtensionModule,
        ElementTemplateIconRenderer,
        ElementTemplateChooserModule,
        CreateAppendAnythingModule,
        CreateAppendElementTemplatesModule
      ],
      moddleExtensions: {
        zeebe: zeebeModdlePackage  // Schimbat la zeebe
      },
      propertiesPanel: {
        parent: '#properties-panel-container'
      }
    });

    this.modeler
      .importXML(this.diagramXml)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.log('Warnings during import:', warnings);
        }

        const canvas = this.modeler.get("canvas");
        // @ts-ignore
        canvas.zoom("fit-viewport");
      })
      .catch((err) => {
        console.error('Error during import:', err);
      });

    this.loadElementTemplates();
  }

  private loadElementTemplates(): void {
    this.http.get('assets/slack.json').subscribe((templates) => {
      // @ts-ignore
      this.modeler.get('elementTemplates').set(templates);
    });
  }
}
